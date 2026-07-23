import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

export default function FaceAuth({ email, token, onVerified, onSkip }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Loading face recognition models...');
  const [isRegistered, setIsRegistered] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const detectionRef = useRef(null);
  const livenessFrames = useRef([]);
  const [livenessCheck, setLivenessCheck] = useState(false);

  const loadModels = useCallback(async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setStatus('camera');
      setMessage('Starting camera...');
    } catch {
      setError('Failed to load face recognition models. Please refresh.');
      setStatus('error');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('ready');
      setMessage('Position your face in the frame');
    } catch {
      setError('Camera access denied. Please allow camera access and refresh.');
      setStatus('error');
    }
  }, []);

  const checkFaceRegistration = useCallback(async () => {
    try {
      const res = await fetch('/api/face-auth/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data } = await res.json();
      setIsRegistered(data.registered);
    } catch {
      setIsRegistered(false);
    }
  }, [token]);

  useEffect(() => {
    loadModels();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (detectionRef.current) cancelAnimationFrame(detectionRef.current);
    };
  }, [loadModels]);

  useEffect(() => {
    if (status === 'camera') startCamera();
  }, [status, startCamera]);

  useEffect(() => {
    if (status !== 'ready' || !videoRef.current) return;
    let running = true;

    async function detect() {
      if (!running || !videoRef.current || videoRef.current.readyState < 2) {
        detectionRef.current = requestAnimationFrame(detect);
        return;
      }
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (det) {
          const box = det.detection.box;
          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          const eyeCenter = det.landmarks.getLeftEye();
          const leftEye = eyeCenter.reduce((a, b) => a.x + b.x, 0) / eyeCenter.length;
          const rightEyeArr = det.landmarks.getRightEye();
          const rightEye = rightEyeArr.reduce((a, b) => a + b.x, 0) / rightEyeArr.length;
          const blink = Math.abs(leftEye - rightEye) < 20;

          livenessFrames.current.push({ blink, ts: Date.now() });
          if (livenessFrames.current.length > 30) livenessFrames.current.shift();

          const hasBlinked = livenessFrames.current.some((f) => f.blink);
          const hasMoved = livenessFrames.current.length >= 5;
          setLivenessCheck(hasBlinked && hasMoved);
        } else {
          setMessage('No face detected. Look at the camera.');
        }
      }

      if (running) detectionRef.current = requestAnimationFrame(detect);
    }

    detectionRef.current = requestAnimationFrame(detect);
    return () => { running = false; cancelAnimationFrame(detectionRef.current); };
  }, [status]);

  useEffect(() => {
    if (status === 'ready') checkFaceRegistration();
  }, [status, checkFaceRegistration]);

  async function getDescriptor() {
    if (!videoRef.current || videoRef.current.readyState < 2) return null;
    const det = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks(true)
      .withFaceDescriptor();
    return det ? Array.from(det.descriptor) : null;
  }

  async function handleRegister() {
    setCapturing(true);
    setCountdown(3);

    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(0);

    const descriptor = await getDescriptor();
    if (!descriptor) {
      setError('No face detected. Please position your face and try again.');
      setCapturing(false);
      return;
    }

    try {
      const res = await fetch('/api/face-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descriptor }),
      });
      const { data, error: err } = await res.json();
      if (err) { setError(err); setCapturing(false); return; }
      if (data?.success) {
        setIsRegistered(true);
        onVerified();
      }
    } catch {
      setError('Registration failed. Please try again.');
    }
    setCapturing(false);
  }

  async function handleVerify() {
    setCapturing(true);
    setCountdown(3);

    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(0);

    const descriptor = await getDescriptor();
    if (!descriptor) {
      setError('No face detected. Please position your face and try again.');
      setCapturing(false);
      return;
    }

    try {
      const res = await fetch('/api/face-auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descriptor }),
      });
      const { data, error: err } = await res.json();
      if (err) { setError(err); setCapturing(false); return; }
      if (data?.verified) {
        onVerified();
      } else if (data?.registered === false) {
        setIsRegistered(false);
      } else {
        setError('Face not recognized. Please try again.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    }
    setCapturing(false);
  }

  return (
    <div className="face-auth-overlay">
      <div className="face-auth-modal glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <span className="inline-block text-3xl mb-3">🔒</span>
          <h3 className="text-xl font-bold text-black dark:text-gray-100">
            {isRegistered === false ? 'Register Your Face' : 'Face Verification'}
          </h3>
          <p className="text-sm text-black/60 dark:text-gray-400 mt-1">
            {isRegistered === false
              ? 'Scan your face to enable 2FA authentication'
              : 'Look at the camera to verify your identity'}
          </p>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-black aspect-video mb-4">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ transform: 'scaleX(-1)' }} />

          {countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-6xl font-bold text-white animate-pulse">{countdown}</span>
            </div>
          )}

          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-teal mx-auto mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-white text-sm">{message}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className={`w-2 h-2 rounded-full ${livenessCheck ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-black/60 dark:text-gray-400">
            {livenessCheck ? 'Liveness check passed' : 'Blink and move slightly for liveness check'}
          </span>
        </div>

        {error && <p className="text-sm text-rose dark:text-purple-300 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={isRegistered === false ? handleRegister : handleVerify}
            disabled={capturing || status !== 'ready' || !livenessCheck}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-teal to-teal-dark text-white text-sm font-semibold rounded-xl hover:from-teal-dark hover:to-teal transition-all disabled:opacity-50 cursor-pointer"
          >
            {capturing ? 'Scanning...' : isRegistered === false ? 'Register Face' : 'Verify Face'}
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-3 border border-blue-200 dark:border-white/10 text-black/60 dark:text-gray-400 text-sm rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>

      <style>{`
        .face-auth-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { fetchTemplateImages, addTemplateImage, removeTemplateImage, updateTemplateImage } from '../data';

export default function TemplateModal({ editing, onClose, onSave }) {
  const formRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const isEdit = editing && editing.id;

  useEffect(() => {
    if (isEdit && formRef.current) {
      formRef.current.name.value = editing.name;
      formRef.current.category.value = editing.category;
      formRef.current.price.value = editing.price;
      formRef.current.description.value = editing.description;
      if (editing.image) setPreview(editing.image);
      if (editing.video) setVideoPreview(editing.video);
      loadPages();
    }
  }, [editing, isEdit]);

  async function loadPages() {
    if (!editing?.id) return;
    setPagesLoading(true);
    const imgs = await fetchTemplateImages(editing.id);
    setPages(imgs);
    setPagesLoading(false);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleVideoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { alert('Video must be under 100MB'); return; }
    setVideoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setVideoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleAddPage(file) {
    if (!editing?.id) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await addTemplateImage({
        template_id: editing.id,
        image_url: ev.target.result,
        sort_order: pages.length,
      });
      await loadPages();
    };
    reader.readAsDataURL(file);
  }

  async function handleRemovePage(id) {
    await removeTemplateImage(id);
    await loadPages();
  }

  async function handleMovePage(id, dir) {
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const newPages = [...pages];
    const target = idx + dir;
    if (target < 0 || target >= newPages.length) return;
    [newPages[idx], newPages[target]] = [newPages[target], newPages[idx]];
    for (let i = 0; i < newPages.length; i++) {
      await updateTemplateImage(newPages[i].id, { sort_order: i });
    }
    await loadPages();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const template = {
      name: fd.get('name'),
      category: fd.get('category'),
      price: Number(fd.get('price')),
      description: fd.get('description'),
      image: preview || '',
      video: videoPreview || '',
    };
    if (isEdit) template.id = editing.id;
    onSave(template);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-card-border m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-warm-dark">
            {isEdit ? 'Edit Template' : 'New Template'}
          </h3>
          <button onClick={onClose} className="text-warm-light hover:text-warm-dark text-xl leading-none cursor-pointer">&times;</button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-gray mb-1">Template Name</label>
            <input name="name" required placeholder="e.g. Portfolio Pro" className="w-full px-3.5 py-2.5 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal" />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-1">Category</label>
            <select name="category" required className="w-full px-3.5 py-2.5 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal cursor-pointer bg-white">
              <option value="">Select category</option>
              <option value="Presentation">Presentation</option>
              <option value="Poster">Poster</option>
              <option value="Resume">Resume</option>
              <option value="Email">Email</option>
              <option value="Invitation">Invitation</option>
              <option value="Mobile Video">Mobile Video</option>
              <option value="Facebook Post">Facebook Post</option>
              <option value="Business Card">Business Card</option>
              <option value="Photo Collage">Photo Collage</option>
              <option value="Whiteboard">Whiteboard</option>
              <option value="Sheet">Sheet</option>
              <option value="Instagram Post">Instagram Post</option>
              <option value="Instagram Story">Instagram Story</option>
              <option value="Landscape Video">Landscape Video</option>
              <option value="Code">Code</option>
              <option value="Flyer">Flyer</option>
              <option value="Logo">Logo</option>
              <option value="Brochure">Brochure</option>
              <option value="Menu">Menu</option>
              <option value="Doc">Doc</option>
              <option value="Websites">Websites</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-1">Price ($)</label>
            <input name="price" type="number" min="0" defaultValue="0" className="w-full px-3.5 py-2.5 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal" />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-1">Description</label>
            <textarea name="description" rows="3" required placeholder="What makes this template special?" className="w-full px-3.5 py-2.5 border border-card-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-1">Cover Image</label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 h-36 relative overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute bottom-2 right-2 bg-white/80 text-xs text-warm-gray px-2.5 py-1 rounded-full shadow-sm">Change</div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-warm-light">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs">Click to upload</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {fileName && <p className="text-xs text-warm-light mt-1">{fileName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-gray mb-1">Template Video (optional)</label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 h-36 relative overflow-hidden">
              {videoPreview ? (
                <>
                  <video src={videoPreview} className="absolute inset-0 w-full h-full object-cover" muted />
                  <div className="absolute bottom-2 right-2 bg-white/80 text-xs text-warm-gray px-2.5 py-1 rounded-full shadow-sm">Change</div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-warm-light">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <span className="text-xs">Click to upload video (max 100MB)</span>
                </div>
              )}
              <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
            </label>
            {videoFileName && <p className="text-xs text-warm-light mt-1">{videoFileName}</p>}
          </div>

          {/* Multi-page images */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-2">Template Pages <span className="text-xs text-warm-light font-normal">(for multi-page templates like websites, brochures, etc.)</span></label>
              <div className="space-y-2 mb-3">
                {pagesLoading ? (
                  <p className="text-xs text-warm-light">Loading pages...</p>
                ) : pages.length === 0 ? (
                  <p className="text-xs text-warm-light">No additional pages yet.</p>
                ) : (
                  pages.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 border border-card-border rounded-xl p-2">
                      <img src={p.image_url} alt={p.caption || `Page ${i + 1}`} className="w-14 h-10 rounded-lg object-cover shrink-0" loading="lazy" decoding="async" />
                      <span className="text-xs text-warm-gray flex-1 truncate">{p.caption || `Page ${i + 1}`}</span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleMovePage(p.id, -1)} disabled={i === 0} className="w-6 h-6 flex items-center justify-center rounded text-xs border border-card-border hover:bg-gray-50 disabled:opacity-30 cursor-pointer" title="Move up">&uarr;</button>
                        <button type="button" onClick={() => handleMovePage(p.id, 1)} disabled={i === pages.length - 1} className="w-6 h-6 flex items-center justify-center rounded text-xs border border-card-border hover:bg-gray-50 disabled:opacity-30 cursor-pointer" title="Move down">&darr;</button>
                        <button type="button" onClick={() => handleRemovePage(p.id)} className="w-6 h-6 flex items-center justify-center rounded text-xs text-rose hover:bg-rose/10 cursor-pointer" title="Remove">&times;</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <label className="flex items-center justify-center w-full border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 py-3 gap-2 text-sm text-warm-light">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Page
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddPage(f); e.target.value = ''; }} className="hidden" />
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-warm-gray border border-card-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-teal rounded-xl hover:bg-teal-dark transition-colors cursor-pointer">
              {isEdit ? 'Save Changes' : 'Add Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

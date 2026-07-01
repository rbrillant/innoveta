import { useEffect, useRef, useState } from 'react';

export default function TemplateModal({ editing, onClose, onSave }) {
  const formRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const isEdit = editing && editing.id;

  useEffect(() => {
    if (isEdit && formRef.current) {
      formRef.current.name.value = editing.name;
      formRef.current.category.value = editing.category;
      formRef.current.price.value = editing.price;
      formRef.current.description.value = editing.description;
      if (editing.image) {
        setPreview(editing.image);
      }
    }
  }, [editing, isEdit]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
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
    };
    if (isEdit) template.id = editing.id;
    onSave(template);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 border border-card-border"
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
              <option value="Websites">Websites</option>
              <option value="Online Courses">Online Courses</option>
              <option value="IT Integration">IT Integration</option>
              <option value="Consulting">Consulting</option>
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
            <label className="block text-sm font-medium text-warm-gray mb-1">Template Image</label>
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-card-border rounded-xl cursor-pointer hover:border-teal/50 transition-colors bg-white/70 h-36 relative overflow-hidden">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-white/80 text-xs text-warm-gray px-2.5 py-1 rounded-full shadow-sm">
                    Change
                  </div>
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

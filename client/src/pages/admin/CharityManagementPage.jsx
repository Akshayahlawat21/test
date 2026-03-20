import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { getAdminCharities, adminCreateCharity, adminUpdateCharity, adminDeleteCharity } from '../../api/admin';

const emptyForm = {
  name: '',
  description: '',
  featured: false,
  images: [],
  events: [],
};

export default function CharityManagementPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' });

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const res = await getAdminCharities();
      setCharities(res.data.charities || []);
    } catch (err) {
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setNewImageUrl('');
    setNewEvent({ title: '', date: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (charity) => {
    setEditingId(charity._id);
    setForm({
      name: charity.name || '',
      description: charity.description || '',
      featured: charity.featured || false,
      images: charity.images || [],
      events: (charity.events || []).map(e => ({
        title: e.title || '',
        date: e.date ? e.date.slice(0, 10) : '',
        description: e.description || '',
      })),
    });
    setNewImageUrl('');
    setNewEvent({ title: '', date: '', description: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await adminUpdateCharity(editingId, form);
        toast.success('Charity updated');
      } else {
        await adminCreateCharity(form);
        toast.success('Charity created');
      }
      setModalOpen(false);
      fetchCharities();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save charity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteCharity(id);
      toast.success('Charity deactivated');
      setConfirmDelete(null);
      fetchCharities();
    } catch (err) {
      toast.error('Failed to deactivate charity');
    }
  };

  const toggleActive = async (charity) => {
    try {
      await adminUpdateCharity(charity._id, { active: !charity.active });
      toast.success(charity.active ? 'Charity deactivated' : 'Charity activated');
      fetchCharities();
    } catch (err) {
      toast.error('Failed to update charity');
    }
  };

  const toggleFeatured = async (charity) => {
    try {
      await adminUpdateCharity(charity._id, { featured: !charity.featured });
      toast.success(charity.featured ? 'Removed from featured' : 'Marked as featured');
      fetchCharities();
    } catch (err) {
      toast.error('Failed to update charity');
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setForm({ ...form, images: [...form.images, { url: newImageUrl.trim(), alt: '' }] });
    setNewImageUrl('');
  };

  const removeImage = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) {
      toast.error('Event title and date are required');
      return;
    }
    setForm({ ...form, events: [...form.events, { ...newEvent }] });
    setNewEvent({ title: '', date: '', description: '' });
  };

  const removeEvent = (index) => {
    setForm({ ...form, events: form.events.filter((_, i) => i !== index) });
  };

  const fmtEur = (n) => (n !== undefined && n !== null ? `\u20AC${n.toLocaleString()}` : '\u20AC0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Charity Management</h1>
          <p className="text-gray-500 text-sm">Add, edit, and manage charity partners</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Charity
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton variant="table-row" count={5} />
          </div>
        ) : charities.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No charities found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Featured</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Active</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Total Received</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {charities.map((charity) => (
                  <tr key={charity._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{charity.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{charity.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(charity)}
                        className={`p-1 rounded-lg transition-colors ${charity.featured ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-gray-400'}`}
                      >
                        <StarIcon className="w-5 h-5" fill={charity.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(charity)}
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          charity.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {charity.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmtEur(charity.totalReceived)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(charity)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(charity._id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-900">Deactivate Charity?</h3>
              <p className="text-sm text-gray-500">This will soft-delete the charity by marking it as inactive. It can be reactivated later.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
                >
                  Deactivate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? 'Edit Charity' : 'Add New Charity'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Charity name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Describe the charity..."
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Featured charity</span>
                </label>

                {/* Images */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Images</label>
                  {form.images.map((img, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600 truncate flex-1">{img.url}</span>
                      <button onClick={() => removeImage(i)} className="text-rose-500 hover:text-rose-700 text-xs">
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Image URL"
                    />
                    <button
                      onClick={addImage}
                      type="button"
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Events */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Events</label>
                  {form.events.map((evt, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 text-xs">
                        <p className="font-medium text-gray-800">{evt.title}</p>
                        <p className="text-gray-500">{evt.date} {evt.description ? `- ${evt.description}` : ''}</p>
                      </div>
                      <button onClick={() => removeEvent(i)} className="text-rose-500 hover:text-rose-700 text-xs shrink-0">
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="space-y-2 p-2 border border-dashed border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Event title"
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="text"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Description (optional)"
                      />
                    </div>
                    <button
                      onClick={addEvent}
                      type="button"
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                    >
                      Add Event
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Charity' : 'Create Charity'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

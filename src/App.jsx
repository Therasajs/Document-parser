import { useEffect, useState } from 'react';
import axios from 'axios';
import { CloudUpload, FileText, Loader2, Trash2, CheckCircle2, AlertTriangle, FileSearch, Layers, ShieldCheck } from 'lucide-react';

const API_BASE_URL = '';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const supportedFormats = ['TXT', 'JSON', 'PDF', 'DOCX', 'CSV', 'XML'];
const parsingSteps = ['Reading file', 'Detecting file type', 'Extracting text', 'Saving metadata'];

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('Ready to upload a document.');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importSummary, setImportSummary] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/documents`);
      setDocuments(response.data);
    } catch (err) {
      setError('Unable to load uploaded documents.');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a supported document first.');
      setSuccess('');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');
    setStatus(`Uploading ${selectedFile.name}...`);
    setUploadProgress(5);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / (event.total || 1));
          setUploadProgress(percent);
        }
      });
      const summary = response.data?.importSummary;
      setImportSummary(summary || null);
      setStatus('Upload complete. Questions were imported and validated.');
      setSuccess(`Upload completed successfully. ${summary?.savedRecords ?? 0} question(s) imported.`);
      setSelectedFile(null);
      setUploadProgress(100);
      await fetchDocuments();
    } catch (err) {
      setStatus('Upload failed.');
      setError(err.response?.data?.error || 'The server could not process the document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/documents/${id}`);
      setSuccess('Document removed successfully.');
      setError('');
      await fetchDocuments();
    } catch (err) {
      setError('Unable to delete the selected document.');
      setSuccess('');
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    const allowedExtensions = ['txt', 'json', 'pdf', 'docx', 'csv', 'xml'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(extension || '')) {
      setError('Unsupported file type. Use TXT, JSON, PDF, DOCX, CSV, or XML.');
      setSuccess('');
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess('');
    setStatus(`Ready to upload ${file.name}.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 rounded-3xl bg-blue-600 px-4 py-4 text-white shadow-lg shadow-blue-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15">
              <CloudUpload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-100">AI Question Importer</p>
              <p className="mt-1 text-base font-semibold">Document upload dashboard</p>
            </div>
          </div>

          <nav className="mt-8 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3 rounded-3xl bg-slate-50 px-4 py-3 font-semibold text-slate-900 shadow-sm">
              <FileSearch className="h-4 w-4 text-blue-600" />
              Import Questions
            </div>
            <div className="flex items-center gap-3 rounded-3xl px-4 py-3 transition hover:bg-slate-100">
              <Layers className="h-4 w-4 text-slate-400" />
              Dashboard
            </div>
            <div className="flex items-center gap-3 rounded-3xl px-4 py-3 transition hover:bg-slate-100">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              Settings
            </div>
          </nav>
        </aside>

        <main className="space-y-8">
          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Import Questions</h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  Drag & drop a supported document file, or browse to select one. The backend extracts the document text automatically and stores the result in PostgreSQL for future AI processing.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Upload Guidelines</p>
                <ul className="mt-4 space-y-3">
                  <li>File should contain questions with options and answers</li>
                  <li>Supported formats: TXT, DOCX, PDF, JSON, CSV, XML</li>
                  <li>Maximum file size: 10 MB</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div
                className={`group relative rounded-[1.75rem] border-2 border-dashed px-6 py-12 text-center transition ${isDragging ? 'border-blue-400 bg-blue-50/70' : 'border-slate-300 bg-slate-50'}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFileSelection(event.dataTransfer.files[0]);
                }}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                  <CloudUpload className="h-10 w-10" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-slate-900">Drag & drop your question file</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Drop a file here or browse from your device. Only extracted text is stored.
                </p>
                <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Browse File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => handleFileSelection(event.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {parsingSteps.map((step) => (
                  <div key={step} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{step}</p>
                    <p className="mt-2 text-xs text-slate-500">{step === 'Reading file' ? 'File pickup' : step === 'Detecting file type' ? 'Type detection' : step === 'Extracting text' ? 'Text extraction' : 'Store metadata'}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Upload progress</p>
                    <p className="mt-1 text-sm text-slate-500">{selectedFile ? selectedFile.name : 'No file selected yet.'}</p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                      </span>
                    ) : 'Upload Document'}
                  </button>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-4 text-sm text-slate-600">{status}</p>
                {success && (
                  <div className="mt-4 flex items-center gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> {success}
                  </div>
                )}
                {importSummary && (
                  <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Import summary</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total rows</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{importSummary.totalRecords ?? 0}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Imported</p>
                        <p className="mt-1 text-lg font-semibold text-emerald-700">{importSummary.savedRecords ?? 0}</p>
                      </div>
                      <div className="rounded-2xl bg-rose-50 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-rose-600">Failed</p>
                        <p className="mt-1 text-lg font-semibold text-rose-700">{(importSummary.errors ?? []).length}</p>
                      </div>
                    </div>
                    {importSummary.errors?.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-rose-600">
                        {importSummary.errors.slice(0, 5).map((err, idx) => (<li key={`${err}-${idx}`}>• {err}</li>))}
                      </ul>
                    )}
                  </div>
                )}
                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" /> {error}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Upload Summary</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900">Latest documents</h2>
                  </div>
                  <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">{documents.length}</span>
                </div>

                <div className="mt-6 space-y-4">
                  {documents.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">{doc.fileName}</p>
                            <p className="mt-1 text-sm text-slate-500">{doc.fileType} • {formatBytes(doc.fileSize)}</p>
                          </div>
                          <button
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600 max-h-24 overflow-hidden">
                          {doc.extractedText?.slice(0, 240) || 'No extracted text available.'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-lg shadow-blue-500/10">
                <div className="flex items-center gap-4 rounded-3xl bg-white/10 p-4">
                  <ShieldCheck className="h-5 w-5 text-blue-300" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">Secure storage</p>
                    <p className="mt-1 text-sm text-slate-200">Only extracted text and metadata are stored; original files are not persisted.</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {supportedFormats.map((format) => (
                    <div key={format} className="rounded-3xl bg-white/10 p-4 text-sm text-slate-100">
                      <p className="font-semibold">{format}</p>
                      <p className="mt-2 text-slate-300">Supported document type</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

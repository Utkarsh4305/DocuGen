import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

interface UploadStepProps {
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  error: string | null;
}

export default function UploadStep({ getRootProps, getInputProps, isDragActive, error }: UploadStepProps) {
  return (
    <div className="upload-step">
      <div 
        {...getRootProps()} 
        className={`bg-dark-gradient border-2 border-dashed border-gray-600/50 rounded-xl p-12 text-center transition-all duration-300 hover:border-cyan-500 cursor-pointer backdrop-blur-sm ${
          isDragActive ? 'border-cyan-500 bg-cyan-500/5' : ''
        } ${error ? 'border-red-500' : ''}`}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.03) 0%, rgba(139, 92, 246, 0.02) 50%, transparent 70%)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <input {...getInputProps()} />
        
        <div className="upload-content">
          {!isDragActive ? (
            <>
              <div className="upload-icon-container mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-gray-600/30">
                  <i className="fas fa-cloud-upload-alt text-2xl text-cyan-400"></i>
                </div>
              </div>
              <div className="upload-text">
                <p className="text-gray-300 mb-2">Drag & drop your ZIP file here</p>
                <p className="text-gray-400 text-sm">
                  or <button type="button" className="text-cyan-400 hover:text-cyan-300 underline">browse files</button>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="drop-active-icon mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500/30 to-cyan-500/30 flex items-center justify-center animate-pulse border border-cyan-500/50">
                  <i className="fas fa-download text-2xl text-green-400"></i>
                </div>
              </div>
              <div className="upload-text">
                <p className="text-green-300">Drop your file here</p>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="upload-error mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center gap-2">
            <i className="fas fa-exclamation-triangle text-red-400"></i>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
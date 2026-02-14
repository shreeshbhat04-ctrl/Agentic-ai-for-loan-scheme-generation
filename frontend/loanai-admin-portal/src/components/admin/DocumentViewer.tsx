import { FileText, Download, Eye, FileSpreadsheet, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentViewerProps {
  documents?: {
    salary_slip?: string;
    bank_statement?: string;
    sanction_letter?: string;
  };
  customerId: string;
}

const documentTypes = [
  { key: 'salary_slip', label: 'Salary Slip', icon: FileText, color: 'text-primary' },
  { key: 'bank_statement', label: 'Bank Statement', icon: FileSpreadsheet, color: 'text-success' },
  { key: 'sanction_letter', label: 'Sanction Letter', icon: FileCheck, color: 'text-accent' },
] as const;

export const DocumentViewer = ({ documents, customerId }: DocumentViewerProps) => {
  const handleView = (docType: string, fileName: string) => {
    toast.info(`Opening ${docType}...`, {
      description: `Viewing ${fileName}`,
    });
  };

  const handleDownload = (docType: string, fileName: string) => {
    toast.success(`Downloading ${docType}...`, {
      description: fileName,
    });
  };

  return (
    <div className="space-y-3">
      {documentTypes.map(({ key, label, icon: Icon, color }) => {
        const fileName = documents?.[key];
        const isAvailable = !!fileName;

        return (
          <div
            key={key}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
              isAvailable 
                ? 'bg-secondary/50 border-border hover:border-primary/50' 
                : 'bg-secondary/20 border-border/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                {isAvailable ? (
                  <p className="text-xs text-muted-foreground font-mono">{fileName}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Not uploaded</p>
                )}
              </div>
            </div>

            {isAvailable && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(label, fileName)}
                  className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary"
                  title="View Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(label, fileName)}
                  className="p-2 hover:bg-success/20 rounded-lg transition-colors text-success"
                  title="Download Document"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

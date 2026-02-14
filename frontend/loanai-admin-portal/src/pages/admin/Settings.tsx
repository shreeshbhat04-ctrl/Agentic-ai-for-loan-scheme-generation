import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, User, Shield, Bell, Key } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { admin } = useAuth();

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold neon-text">Settings</h1>
              <p className="text-muted-foreground">Manage your admin preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="data-card animate-fade-up-delay-1">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Banker Name</label>
              <input
                type="text"
                defaultValue={admin?.name}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Banker ID</label>
              <input
                type="text"
                defaultValue={admin?.bankerId}
                className="input-field font-mono"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Role</label>
              <input
                type="text"
                defaultValue={admin?.role}
                className="input-field"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Branch</label>
              <input
                type="text"
                defaultValue="Mumbai Central"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="data-card animate-fade-up-delay-2">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <select className="input-field w-auto">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="data-card animate-fade-up-delay-3">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>

          <div className="space-y-4">
            {[
              { label: 'New loan applications', desc: 'Get notified for new applications' },
              { label: 'Document uploads', desc: 'When customers upload documents' },
              { label: 'Chat messages', desc: 'Real-time customer messages' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-foreground after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-neon hover:scale-[1.01] transition-all"
        >
          Save Changes
        </button>
      </div>
    </AdminLayout>
  );
};

export default Settings;

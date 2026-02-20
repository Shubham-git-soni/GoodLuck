"use client";

import { useState } from "react";
import { Palette, Upload } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import PageHeader from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function WhiteLabelSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "CRM System",
    subdomain: "crm-demo",
    primaryColor: "#3b82f6",
    accentColor: "#10b981",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    modules: {
      schools: true,
      booksellers: true,
      specimens: true,
      tada: true,
      feedback: true,
    },
  });

  const handleSave = () => {
    toast.success("White label settings saved successfully!");
    console.log("Settings:", settings);
  };

  return (
    <PageContainer>
      <PageHeader
        title="White Label Settings"
        description="Customize the branding and modules of your CRM"
      />

      <div className="space-y-6">
        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex">
                <Input
                  id="subdomain"
                  value={settings.subdomain}
                  onChange={(e) =>
                    setSettings({ ...settings, subdomain: e.target.value })
                  }
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-sm text-muted-foreground">
                  .crm.com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Favicon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Module Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.modules).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enable/disable this module
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      modules: { ...settings.modules, [key]: checked },
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

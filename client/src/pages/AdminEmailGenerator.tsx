import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Trash2,
  Image,
  Type,
  Square,
  Sparkles,
  Send,
  Eye,
  Save,
  GripVertical,
  LogOut,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

// Block types
interface TextBlock {
  type: "text";
  id: string;
  content: string;
  style?: "normal" | "heading" | "subheading";
}

interface ImageBlock {
  type: "image";
  id: string;
  url: string;
  alt?: string;
}

interface ButtonBlock {
  type: "button";
  id: string;
  text: string;
  url: string;
  color?: string;
}

interface FeatureBlock {
  type: "feature";
  id: string;
  icon: string;
  title: string;
  description: string;
  iconColor?: string;
}

interface DividerBlock {
  type: "divider";
  id: string;
}

type EmailBlock = TextBlock | ImageBlock | ButtonBlock | FeatureBlock | DividerBlock;

// Icon library with categories
const ICON_LIBRARY: Record<string, string[]> = {
  wellness: ["🧘", "💆", "🌿", "🌸", "✨", "🌅", "🌊", "🦋"],
  health: ["💪", "❤️", "🧠", "🏃", "😴", "🥗", "💊", "🩺"],
  progress: ["🎯", "📈", "🏆", "⭐", "🚀", "📊", "✅", "🔑"],
  communication: ["💬", "📧", "🤝", "👥", "📞", "🔔", "📢", "💡"],
  time: ["📅", "⏰", "🕐", "⌛", "📆"],
  emotions: ["😊", "🙏", "🤗", "😌", "💖", "🌈"],
  therapy: ["🛋️", "📝", "🎧", "🌱", "🔄", "🌟"],
};

const ICON_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Green", value: "#10B981" },
  { name: "Pink", value: "#EC4899" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Red", value: "#EF4444" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
];

const BUTTON_COLORS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
  { name: "Green", value: "#10B981" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Pink", value: "#EC4899" },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function AdminEmailGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Email state
  const [subject, setSubject] = useState("Your Weekly Update from iVASA");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      type: "text",
      id: generateId(),
      content: "Hello there,",
      style: "heading",
    },
    {
      type: "text",
      id: generateId(),
      content: "We hope you're doing well on your therapeutic journey. Here's what's new this week.",
      style: "normal",
    },
  ]);

  // Recipients
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [iconSearchText, setIconSearchText] = useState("");
  const [suggestedIcon, setSuggestedIcon] = useState("");
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await apiRequest("/api/auth/me");
    } catch {
      setLocation("/admin");
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setLocation("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Block management
  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = (() => {
      switch (type) {
        case "text":
          return { type: "text", id: generateId(), content: "New text block", style: "normal" as const };
        case "image":
          return { type: "image", id: generateId(), url: "", alt: "" };
        case "button":
          return { type: "button", id: generateId(), text: "Click Here", url: "https://beta.ivasa.ai", color: "#8B5CF6" };
        case "feature":
          return { type: "feature", id: generateId(), icon: "✨", title: "Feature Title", description: "Feature description goes here.", iconColor: "#8B5CF6" };
        case "divider":
          return { type: "divider", id: generateId() };
      }
    })();

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetType: "header" | "block") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await apiRequest("/api/admin/upload-image", {
          method: "POST",
          body: JSON.stringify({
            imageData: reader.result,
            filename: file.name,
          }),
        });

        if (targetType === "header") {
          setHeaderImageUrl(response.imageUrl);
        } else if (selectedBlockId) {
          updateBlock(selectedBlockId, { url: response.imageUrl });
        }

        toast({
          title: "Image uploaded",
          description: "Your image has been uploaded successfully.",
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // AI icon generation
  const generateAIIcon = async () => {
    if (!iconSearchText.trim()) return;

    setIsGeneratingIcon(true);
    try {
      const response = await apiRequest("/api/admin/generate-icon", {
        method: "POST",
        body: JSON.stringify({ text: iconSearchText }),
      });

      setSuggestedIcon(response.iconUrl);
    } catch (error) {
      console.error("Icon generation error:", error);
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  // Recipients management
  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient("");
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  // Preview
  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/admin/preview-email", {
        method: "POST",
        body: JSON.stringify({
          subject,
          headerImageUrl,
          content: blocks,
        }),
      });

      setPreviewHtml(response.html);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send email
  const sendEmail = async () => {
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const response = await apiRequest("/api/admin/send-email", {
        method: "POST",
        body: JSON.stringify({
          recipients,
          subject,
          headerImageUrl,
          content: blocks,
        }),
      });

      toast({
        title: "Emails sent!",
        description: `Successfully sent ${response.sent} email(s). ${response.failed > 0 ? `Failed: ${response.failed}` : ""}`,
      });

      if (response.errors?.length > 0) {
        console.error("Email errors:", response.errors);
      }
    } catch (error) {
      toast({
        title: "Send failed",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://start.ivasa.ai/ivasa-logo.png"
              alt="iVASA"
              className="h-8 w-auto"
            />
            <span className="text-white font-semibold">Email Generator</span>
            <span className="text-white/30 mx-2">|</span>
            <button
              onClick={() => setLocation('/x-posts')}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              X Posts
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePreview}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={sendEmail}
              disabled={isSending || recipients.length === 0}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Email Builder */}
          <div className="lg:col-span-2 space-y-4">
            {/* Subject & Header */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Email Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-purple-200">Subject Line</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-200">Header Image</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={headerImageUrl}
                      onChange={(e) => setHeaderImageUrl(e.target.value)}
                      placeholder="Image URL or upload..."
                      className="bg-white/10 border-white/20 text-white flex-1"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "header")}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  </div>
                  {headerImageUrl && (
                    <img
                      src={headerImageUrl}
                      alt="Header preview"
                      className="mt-2 rounded-lg max-h-32 object-cover"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Content Blocks */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg">Content Blocks</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBlock("text")}
                    className="text-purple-300 hover:text-white hover:bg-white/10"
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBlock("image")}
                    className="text-purple-300 hover:text-white hover:bg-white/10"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBlock("button")}
                    className="text-purple-300 hover:text-white hover:bg-white/10"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addBlock("feature")}
                    className="text-purple-300 hover:text-white hover:bg-white/10"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedBlockId === block.id
                            ? "bg-purple-500/20 border-purple-500"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedBlockId(block.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-purple-300" />
                            <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                              {block.type}
                            </Badge>
                            <span className="text-white/70 text-sm truncate max-w-[200px]">
                              {block.type === "text"
                                ? block.content.substring(0, 30) + (block.content.length > 30 ? "..." : "")
                                : block.type === "feature"
                                ? block.title
                                : block.type === "button"
                                ? block.text
                                : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(block.id, "up");
                              }}
                              disabled={index === 0}
                              className="h-6 w-6 p-0 text-purple-300 hover:text-white"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(block.id, "down");
                              }}
                              disabled={index === blocks.length - 1}
                              className="h-6 w-6 p-0 text-purple-300 hover:text-white"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Block Editor & Recipients */}
          <div className="space-y-4">
            {/* Block Editor */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  {selectedBlock ? `Edit ${selectedBlock.type} Block` : "Select a Block"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBlock ? (
                  <div className="space-y-4">
                    {selectedBlock.type === "text" && (
                      <>
                        <div>
                          <Label className="text-purple-200">Style</Label>
                          <Select
                            value={selectedBlock.style || "normal"}
                            onValueChange={(value) =>
                              updateBlock(selectedBlock.id, {
                                style: value as "normal" | "heading" | "subheading",
                              })
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="heading">Heading</SelectItem>
                              <SelectItem value="subheading">Subheading</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-purple-200">Content</Label>
                          <Textarea
                            value={selectedBlock.content}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, { content: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white mt-1 min-h-[100px]"
                          />
                        </div>
                      </>
                    )}

                    {selectedBlock.type === "image" && (
                      <>
                        <div>
                          <Label className="text-purple-200">Image URL</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={selectedBlock.url}
                              onChange={(e) =>
                                updateBlock(selectedBlock.id, { url: e.target.value })
                              }
                              placeholder="Enter image URL..."
                              className="bg-white/10 border-white/20 text-white"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id="block-image-upload"
                              onChange={(e) => handleImageUpload(e, "block")}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                document.getElementById("block-image-upload")?.click()
                              }
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Image className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-purple-200">Alt Text</Label>
                          <Input
                            value={selectedBlock.alt || ""}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, { alt: e.target.value })
                            }
                            placeholder="Image description..."
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        {selectedBlock.url && (
                          <img
                            src={selectedBlock.url}
                            alt={selectedBlock.alt}
                            className="rounded-lg max-h-32 object-cover"
                          />
                        )}
                      </>
                    )}

                    {selectedBlock.type === "button" && (
                      <>
                        <div>
                          <Label className="text-purple-200">Button Text</Label>
                          <Input
                            value={selectedBlock.text}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, { text: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200">URL</Label>
                          <Input
                            value={selectedBlock.url}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, { url: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200">Color</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {BUTTON_COLORS.map((color) => (
                              <button
                                key={color.value}
                                onClick={() =>
                                  updateBlock(selectedBlock.id, { color: color.value })
                                }
                                className={`w-8 h-8 rounded-full transition-all ${
                                  selectedBlock.color === color.value
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                                    : ""
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedBlock.type === "feature" && (
                      <>
                        <div>
                          <Label className="text-purple-200">Title</Label>
                          <Input
                            value={selectedBlock.title}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, { title: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200">Description</Label>
                          <Textarea
                            value={selectedBlock.description}
                            onChange={(e) =>
                              updateBlock(selectedBlock.id, { description: e.target.value })
                            }
                            className="bg-white/10 border-white/20 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-purple-200">Icon</Label>
                          <Tabs defaultValue="library" className="mt-1">
                            <TabsList className="bg-white/10">
                              <TabsTrigger value="library" className="data-[state=active]:bg-purple-500">
                                Library
                              </TabsTrigger>
                              <TabsTrigger value="ai" className="data-[state=active]:bg-purple-500">
                                AI Generate
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="library" className="mt-2">
                              <ScrollArea className="h-[150px]">
                                {Object.entries(ICON_LIBRARY).map(([category, icons]) => (
                                  <div key={category} className="mb-2">
                                    <p className="text-xs text-purple-300 mb-1 capitalize">
                                      {category}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {icons.map((icon) => (
                                        <button
                                          key={icon}
                                          onClick={() =>
                                            updateBlock(selectedBlock.id, { icon })
                                          }
                                          className={`w-8 h-8 rounded text-lg hover:bg-white/10 transition-colors ${
                                            selectedBlock.icon === icon
                                              ? "bg-purple-500/50"
                                              : ""
                                          }`}
                                        >
                                          {icon}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </ScrollArea>
                            </TabsContent>
                            <TabsContent value="ai" className="mt-2">
                              <div className="space-y-2">
                                <Input
                                  value={iconSearchText}
                                  onChange={(e) => setIconSearchText(e.target.value)}
                                  placeholder="Describe what you need..."
                                  className="bg-white/10 border-white/20 text-white"
                                />
                                <Button
                                  size="sm"
                                  onClick={generateAIIcon}
                                  disabled={isGeneratingIcon}
                                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
                                >
                                  {isGeneratingIcon ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 mr-2" />
                                  )}
                                  Generate Icon
                                </Button>
                                {suggestedIcon && (
                                  <div className="flex items-center gap-2 p-2 bg-white/10 rounded">
                                    <span className="text-2xl">{suggestedIcon}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        updateBlock(selectedBlock.id, { icon: suggestedIcon });
                                        setSuggestedIcon("");
                                      }}
                                      className="border-white/20 text-white hover:bg-white/10"
                                    >
                                      Use This
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                        <div>
                          <Label className="text-purple-200">Icon Background Color</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ICON_COLORS.map((color) => (
                              <button
                                key={color.value}
                                onClick={() =>
                                  updateBlock(selectedBlock.id, { iconColor: color.value })
                                }
                                className={`w-8 h-8 rounded-full transition-all ${
                                  selectedBlock.iconColor === color.value
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                                    : ""
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedBlock.type === "divider" && (
                      <p className="text-purple-300 text-sm">
                        This is a divider block. It adds visual separation between content.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-purple-300 text-center py-8">
                    Click on a block to edit it, or add new blocks using the buttons above.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recipients */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recipients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="email@example.com"
                    className="bg-white/10 border-white/20 text-white"
                    onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                  />
                  <Button
                    onClick={addRecipient}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {recipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 bg-white/5 rounded"
                      >
                        <span className="text-white text-sm truncate">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(email)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {recipients.length === 0 && (
                      <p className="text-purple-300 text-sm text-center py-4">
                        No recipients added yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will appear to recipients
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh]">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[800px] border-0"
              title="Email Preview"
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

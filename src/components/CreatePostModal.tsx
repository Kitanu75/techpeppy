"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { CommunityType, PostType } from "@/lib/models/types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: CommunityType[];
  defaultType?: "text" | "image";
  onPostCreated: (post: PostType) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  communities,
  defaultType = "text",
  onPostCreated,
}) => {
  const [postType, setPostType] = useState<"text" | "image">(defaultType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(
    communities[0]?.slug || "tech-news"
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageList, setImageList] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("Setup, Hardware");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImageList([...imageList, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageList(imageList.filter((_, i) => i !== index));
  };

  // Sample photo helpers for quick testing
  const addSamplePhoto = (url: string) => {
    setImageList([...imageList, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a post title");
      return;
    }

    if (postType === "image" && imageList.length === 0 && !imageUrl.trim()) {
      setError("Please add at least one photo URL for an Image Post");
      return;
    }

    const finalImages = [...imageList];
    if (imageUrl.trim()) {
      finalImages.push(imageUrl.trim());
    }

    setSubmitting(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          images: postType === "image" ? finalImages : [],
          postType,
          communitySlug: selectedCommunity,
          tags,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create post");
      }

      onPostCreated(data.post);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to publish post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#2c3347] bg-[#161924] shadow-2xl p-5 sm:p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#252b3d] mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Create a Post on TechPeppy</span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-[#202534] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Community Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Select Community
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full rounded-xl border border-[#2b3145] bg-[#1a1e2b] px-3.5 py-2 text-sm text-gray-200 focus:border-orange-500 focus:outline-none"
          >
            {communities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon} t/{c.slug} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Post Type Tabs */}
        <div className="flex rounded-xl bg-[#11131a] p-1 border border-[#232838] mb-4">
          <button
            type="button"
            onClick={() => setPostType("text")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all ${
              postType === "text"
                ? "bg-[#202535] text-white shadow-sm border border-[#30384f]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText className="h-4 w-4 text-orange-400" />
            <span>📝 Text / Discussion</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType("image")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all ${
              postType === "image"
                ? "bg-[#202535] text-white shadow-sm border border-[#30384f]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ImageIcon className="h-4 w-4 text-purple-400" />
            <span>📸 Photos & Images</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Title <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your tech post an interesting title..."
              className="w-full rounded-xl border border-[#2b3145] bg-[#1a1e2b] px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* If Image Post: Image URLs & Previews */}
          {postType === "image" && (
            <div className="space-y-3 rounded-xl border border-[#2b3145] bg-[#131620] p-3.5">
              <label className="block text-xs font-medium text-gray-300">
                Photo URL (Direct Image Link)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or any image link"
                  className="flex-1 rounded-xl border border-[#2b3145] bg-[#1a1e2b] px-3 py-2 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors"
                >
                  Add Photo
                </button>
              </div>

              {/* Sample Photo Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-gray-400">
                <span>Quick demo photo:</span>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="rounded-md bg-[#212638] px-2 py-0.5 text-purple-300 hover:bg-[#2b324a]"
                >
                  + Retro PC Setup
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="rounded-md bg-[#212638] px-2 py-0.5 text-purple-300 hover:bg-[#2b324a]"
                >
                  + Hardware Lab
                </button>
              </div>

              {/* Added Images Preview List */}
              {imageList.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {imageList.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-[#353d54] bg-black"
                    >
                      <img
                        src={img}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 rounded-md bg-red-600/80 p-1 text-white hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Description / Markdown Content */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              {postType === "image" ? "Photo Caption / Specs Description" : "Article & Discussion Content"}
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === "image"
                  ? "Describe your desk setup gear, camera settings, or hardware specs..."
                  : "Share your thoughts, code snippets, tech insights..."
              }
              className="w-full rounded-xl border border-[#2b3145] bg-[#1a1e2b] p-3 text-sm text-gray-100 placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Setup, Coding, Hardware, AI"
              className="w-full rounded-xl border border-[#2b3145] bg-[#1a1e2b] px-3.5 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#252b3d]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#2b3145] px-4 py-2 text-xs sm:text-sm font-semibold text-gray-300 hover:bg-[#1f2331] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ff6333] px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:from-[#e03d00] hover:to-[#eb5323] disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? "Publishing..." : "Post to Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-2xl p-5 sm:p-6 my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b] mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Publish on TechPeppy</span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-[#1e293b] hover:text-white transition-colors cursor-pointer"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Topic
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] px-3.5 py-2 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {communities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon} t/{c.slug} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Post Type Tabs */}
        <div className="flex rounded-xl bg-[#0b0f17] p-1 border border-[#1e293b] mb-4">
          <button
            type="button"
            onClick={() => setPostType("text")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              postType === "text"
                ? "bg-[#141e33] text-emerald-400 shadow-sm border border-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>📝 Engineering Discussion</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType("image")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              postType === "image"
                ? "bg-[#141e33] text-teal-400 shadow-sm border border-teal-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="h-4 w-4 text-teal-400" />
            <span>📸 Workstation & Hardware Photos</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Title <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architectural Trade-offs in Modern Headless CMS Stacks..."
              className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* If Image Post: Image URLs & Previews */}
          {postType === "image" && (
            <div className="space-y-3 rounded-xl border border-[#1e293b] bg-[#141e33] p-3.5">
              <label className="block text-xs font-medium text-slate-300">
                Photo URL (Direct Image Link)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or any image link"
                  className="flex-1 rounded-xl border border-[#1e293b] bg-[#111726] px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Add Photo
                </button>
              </div>

              {/* Sample Photo Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                <span>Quick demo photo:</span>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="rounded-md bg-[#162238] px-2 py-0.5 text-emerald-400 hover:bg-[#1e2d4a] cursor-pointer"
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
                  className="rounded-md bg-[#162238] px-2 py-0.5 text-emerald-400 hover:bg-[#1e2d4a] cursor-pointer"
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
              className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Architecture, HeadlessCMS, NextJS, Python"
              className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#1e293b] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-[#162238] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

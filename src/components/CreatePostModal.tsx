"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
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
    communities[0]?.slug || "desk-setups"
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

  const addSamplePhoto = (url: string) => {
    setImageList([...imageList, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (postType === "image" && imageList.length === 0 && !imageUrl.trim()) {
      setError("Please add at least one image URL");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200/90 bg-white shadow-2xl p-5 sm:p-6 my-8 text-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
          <h2 className="text-base font-bold text-zinc-950">Create a Post</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Channel Selector */}
        <div className="mb-3.5">
          <label className="block text-xs font-medium text-zinc-500 mb-1">Select Channel</label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2 text-xs sm:text-sm text-zinc-950 focus:border-zinc-400 focus:bg-white focus:outline-none cursor-pointer"
          >
            {communities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} (t/{c.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Post Type Selector */}
        <div className="flex rounded-xl bg-zinc-100 p-1 border border-zinc-200/60 mb-4">
          <button
            type="button"
            onClick={() => setPostType("text")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              postType === "text"
                ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/60"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Discussion / Text</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType("image")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              postType === "image"
                ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/60"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Photo / Setup</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production RAG Architecture with Redis Vector Search"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
            />
          </div>

          {postType === "image" && (
            <div className="space-y-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3">
              <label className="block text-xs font-medium text-zinc-500">Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... direct image link"
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-xl bg-zinc-950 hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Sample Presets */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-zinc-400">
                <span>Sample photo:</span>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="text-emerald-700 font-medium hover:underline cursor-pointer"
                >
                  Workspace
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="text-emerald-700 font-medium hover:underline cursor-pointer"
                >
                  Hardware
                </button>
              </div>

              {/* Previews */}
              {imageList.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {imageList.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200"
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 rounded bg-black/60 p-1 text-rose-300 hover:text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              {postType === "image" ? "Description" : "Content"}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide deep technical reasoning, code snippets, or workstation specs..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none resize-none font-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Architecture, NextJS, Redis"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-1.5 text-xs text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-950 hover:bg-zinc-800 px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

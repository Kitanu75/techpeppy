"use client";

import React, { useState } from "react";
import { X, FileText, Image as ImageIcon, Trash2, AlertCircle } from "lucide-react";
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
    communities[0]?.slug || "software-architecture"
  );
  const [imageUrl, setImageUrl] = useState("");
  const [imageList, setImageList] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("Architecture, Systems");
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
      setError("Please enter a headline");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish story");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111315]/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-xl border border-[#E4E4E7] bg-white shadow-2xl p-6 sm:p-7 my-8 text-[#111315]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7] mb-5">
          <div>
            <span className="text-xs font-semibold text-[#0F766E]">New Story</span>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[#111315]">
              Publish to TechPeppy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111315] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-medium text-[#52525B] mb-1.5">Section</label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full rounded-lg border border-[#D4D4D8] bg-white px-3 py-2 text-sm text-[#111315] focus:border-[#0F766E] focus:outline-none cursor-pointer"
          >
            {communities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex rounded-lg bg-[#F4F4F5] p-1 border border-[#E4E4E7] mb-4">
          <button
            type="button"
            onClick={() => setPostType("text")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              postType === "text"
                ? "bg-white text-[#111315] shadow-2xs font-semibold"
                : "text-[#52525B] hover:text-[#111315]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Article / Note</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType("image")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              postType === "image"
                ? "bg-white text-[#111315] shadow-2xs font-semibold"
                : "text-[#52525B] hover:text-[#111315]"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Photo / Setup</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#52525B] mb-1.5">Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production RAG Architecture with Redis Vector Search"
              className="w-full rounded-lg border border-[#D4D4D8] bg-white px-3.5 py-2 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
            />
          </div>

          {postType === "image" && (
            <div className="space-y-2.5 rounded-lg border border-[#E4E4E7] bg-[#F4F4F5] p-3.5">
              <label className="block text-xs font-medium text-[#52525B]">Cover Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... direct image link"
                  className="flex-1 rounded-lg border border-[#D4D4D8] bg-white px-3 py-1.5 text-xs text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="rounded-lg bg-[#111315] hover:bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-[#71717A]">
                <span>Sample photo:</span>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="text-[#0F766E] font-medium hover:underline cursor-pointer"
                >
                  Workspace
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() =>
                    addSamplePhoto(
                      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="text-[#0F766E] font-medium hover:underline cursor-pointer"
                >
                  Hardware
                </button>
              </div>

              {imageList.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {imageList.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video overflow-hidden rounded-lg bg-white border border-[#E4E4E7]"
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 rounded bg-[#111315]/80 p-1 text-white hover:bg-[#DC2626] cursor-pointer"
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
            <label className="block text-xs font-medium text-[#52525B] mb-1.5">
              {postType === "image" ? "Description" : "Story content"}
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your engineering breakdown, benchmarks, or workstation details..."
              className="w-full rounded-lg border border-[#D4D4D8] bg-white p-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#52525B] mb-1.5">Tags</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Architecture, NextJS, Redis"
              className="w-full rounded-lg border border-[#D4D4D8] bg-white px-3.5 py-2 text-xs text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E4E4E7]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-[#52525B] hover:text-[#111315] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#111315] hover:bg-[#0F766E] px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

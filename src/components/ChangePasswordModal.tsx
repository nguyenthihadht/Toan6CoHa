import React, { useState } from "react";
import { X, Key, AlertCircle, CheckCircle, Check } from "lucide-react";

interface ChangePasswordModalProps {
  adminPassword?: string;
  onClose: () => void;
  onChangePassword: (newPassword: string) => Promise<void>;
}

export default function ChangePasswordModal({
  adminPassword = "admin",
  onClose,
  onChangePassword
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const expectedPassword = adminPassword || "admin";
    if (currentPassword !== expectedPassword) {
      setError("Mật khẩu hiện tại không chính xác!");
      return;
    }

    if (newPassword.trim().length < 4) {
      setError("Mật khẩu mới phải có tối thiểu 4 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và mật khẩu nhập lại không khớp nhau!");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Mật khẩu mới không được trùng với mật khẩu cũ!");
      return;
    }

    try {
      setIsSubmitting(true);
      await onChangePassword(newPassword.trim());
      setSuccess("Đã thay đổi mật khẩu giáo viên thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print" 
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-2xl shrink-0">
            <Key className="h-6 w-6" />
          </div>
          <div className="leading-snug">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-50">
              Thay đổi mật khẩu Giáo viên
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
              Mật khẩu mới sẽ áp dụng ngay lập tức cho tài khoản của Cô Nguyễn Hà trên tất cả thiết bị.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu đang sử dụng"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Mật khẩu mới</label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              required
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-2xs font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 leading-relaxed">
              <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-2xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 leading-relaxed animate-pulse">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 text-2xs font-bold transition-all disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-2xs font-bold transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> 
              {isSubmitting ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

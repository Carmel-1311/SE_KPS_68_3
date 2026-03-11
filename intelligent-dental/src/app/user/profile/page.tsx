"use client";

import { useState, type ChangeEvent } from "react";
import { mockUserProfile, type UserProfile } from "@/mock/mockUserProfile";

function UserForm() {
  const [formData, setFormData] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    window.setTimeout(() => setNotification(null), 3500);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirm(false);
    setIsSaving(true);

    try {
      // TODO: Connect to your API endpoint
      // const response = await fetch("/api/user/profile", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsEditing(false);
      showNotification("success", "ข้อมูลได้รับการบันทึกเรียบร้อย");
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("error", "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissConfirm = () => {
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      allergy: mockUserProfile.allergy,
    }));
    setIsEditing(false);
  };

  return (
    <div style={styles.formContainer}>
      {notification && (
        <div style={styles.notification}>{notification.message}</div>
      )}

      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <p style={{ margin: 0, fontSize: "1rem" }}>
              คุณต้องการบันทึกข้อมูลใช่หรือไม่?
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginTop: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleDismissConfirm}
                style={{ ...styles.button, ...styles.buttonSecondary }}
                disabled={isSaving}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSaving}
                style={{ ...styles.button, ...styles.buttonSuccess }}
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.profileHeader}>
        <div style={styles.avatar}>{formData.name.charAt(0)}</div>
        <div style={styles.headerInfo}>
          <div style={styles.headerName}>{formData.name}</div>
          <div style={styles.headerSub}>{formData.email}</div>
          <div style={styles.headerSub}>{formData.phone}</div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>ข้อมูลทั่วไป</div>
        <div style={styles.rowGroup}>
          <label style={styles.labelRow}>วันเกิด (Birthday)</label>
          <div style={{ ...styles.valueBox, ...styles.valueRow }}>
            {formData.birthday}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>ข้อมูลอาการแพ้(Allergy)</div>
        <div style={styles.formGroup}>
          {/* <label style={styles.label}>อาการแพ้ (Allergy)</label> */}
          <textarea
            name="allergy"
            value={formData.allergy}
            onChange={handleChange}
            disabled={!isEditing}
            rows={4}
            style={{
              ...styles.input,
              ...(isEditing ? styles.inputEnabled : styles.inputDisabled),
              resize: "vertical",
            }}
          />
        </div>
      </div>

      <div style={styles.buttonGroup}>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            แก้ไข (Edit)
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึก (Save)"}
            </button>
            <button
              onClick={handleCancel}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              ยกเลิก (Cancel)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  formContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  formGroup: {
    marginBottom: "1.5rem",
    display: "flex" as const,
    flexDirection: "column" as const,
  },
  rowGroup: {
    marginBottom: "1.25rem",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "1rem",
  },
  label: {
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#333",
    fontSize: "0.95rem",
  },
  labelRow: {
    fontWeight: "600",
    color: "#333",
    fontSize: "0.95rem",
    width: "140px",
  },
  valueRow: {
    flex: 1,
    minWidth: 0,
  },
  valueBox: {
    padding: "0.75rem 0",
    borderRadius: "0",
    backgroundColor: "transparent",
    border: "none",
    color: "#333",
    fontFamily: "inherit",
    fontSize: "1rem",
    lineHeight: 1.4,
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
    marginBottom: "1.5rem",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#374151",
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  headerName: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#111827",
  },
  headerSub: {
    fontSize: "0.9rem",
    color: "#4b5563",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1.25rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    marginBottom: "1rem",
    color: "#111827",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    fontFamily: "inherit",
    fontWeight: "400",
  },
  inputEnabled: {
    backgroundColor: "#fff",
    color: "#333",
    cursor: "text",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#666",
    cursor: "not-allowed",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
    justifyContent: "center",
  },
  button: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
  },
  buttonPrimary: {
    backgroundColor: "#0070f3",
    color: "white",
  },
  buttonSuccess: {
    backgroundColor: "#10b981",
    color: "white",
  },
  buttonSecondary: {
    backgroundColor: "#6b7280",
    color: "white",
  },
  notification: {
    padding: "0.85rem 1rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    textAlign: "center" as const,
    fontWeight: 600,
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    color: "#333",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "1.25rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
};

export default function UserProfilePage() {
  return (
    <div style={{ padding: "2rem 1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#333" }}>
        ข้อมูลส่วนตัว
      </h1>
      <UserForm />
    </div>
  );
}

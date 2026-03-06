"use client";

import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  allergy: string;
};

// ================= MOCK DATA =================
const mockUser: User = {
  id: 1,
  name: "สมชาย ใจดี",
  email: "user@example.com",
  phone: "0812345678",
  birthday: "1990-08-24",
  allergy: "ไม่มี",
};

function UserForm() {
  const [formData, setFormData] = useState<User>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Connect to your API endpoint
      // const response = await fetch("/api/user/profile", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      setTimeout(() => {
        setIsEditing(false);
        setIsSaving(false);
        alert("ข้อมูลได้รับการบันทึกเรียบร้อย");
      }, 500);
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsSaving(false);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleCancel = () => {
    setFormData(mockUser);
    setIsEditing(false);
  };

  return (
    <div style={styles.formContainer}>
      <div style={styles.formGroup}>
        <label style={styles.label}>ชื่อ (Name)</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={!isEditing}
          style={{
            ...styles.input,
            ...(isEditing ? styles.inputEnabled : styles.inputDisabled),
          }}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>อีเมล (Email)</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!isEditing}
          style={{
            ...styles.input,
            ...(isEditing ? styles.inputEnabled : styles.inputDisabled),
          }}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>เบอร์โทรศัพท์ (Phone)</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={!isEditing}
          style={{
            ...styles.input,
            ...(isEditing ? styles.inputEnabled : styles.inputDisabled),
          }}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>วันเกิด (Birthday)</label>
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          disabled={!isEditing}
          style={{
            ...styles.input,
            ...(isEditing ? styles.inputEnabled : styles.inputDisabled),
          }}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>ภูมิแพ้ (Allergy)</label>
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
  label: {
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#333",
    fontSize: "0.95rem",
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

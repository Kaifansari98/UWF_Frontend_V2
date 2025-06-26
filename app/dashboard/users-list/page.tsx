"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAllUsers, deleteUser } from "@/features/users/GetUsersSlice";
import { AgGridReact } from "ag-grid-react";
import { Pencil, Trash2 } from "lucide-react";
import { ColDef } from "ag-grid-community";
import EditUserModal from "@/components/EditUserModal";
import { User } from "@/features/users/GetUsersSlice";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function UsersListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.getUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const columnDefs: ColDef[] = [
    { field: "id", sortable: true, filter: true },
    {
      field: "username",
      headerName: "Username",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const profilePic = params.data.profile_pic;
        const username = params.value;

        const containerStyle: React.CSSProperties = {
          display: "flex",
          alignItems: "center",
          gap: "8px",
        };

        const imgStyle: React.CSSProperties = {
          width: "32px",
          height: "32px",
          borderRadius: "9999px",
          objectFit: "cover",
          border: "1px solid #ccc",
        };

        return (
          <div style={containerStyle}>
            <img
              src={profilePic || "/avatar.png"}
              alt="Profile"
              style={imgStyle}
            />
            <span>{username}</span>
          </div>
        );
      }
    },
    { field: "full_name", headerName: "Full Name", sortable: true, filter: true },
    { field: "email", sortable: true, filter: true },
    { field: "role", sortable: true, filter: true },
    { field: "age", sortable: true, filter: true },
    { field: "country", sortable: true, filter: true },
    { field: "state", sortable: true, filter: true },
    { field: "city", sortable: true, filter: true },
    { field: "pincode", sortable: true, filter: true },
    { field: "mobile_no", headerName: "Mobile No", sortable: true, filter: true },
    {
      headerName: "Actions",
      cellRenderer: (params: any) => {
        return (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", height: '100%', alignItems: 'center' }}>
            <Pencil
              size={18}
              style={{ color: "#292929", cursor: "pointer" }}
              onClick={() => setSelectedUser(params.data)}
            />
            <Trash2
              size={18}
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => {
                setUserToDelete(params.data);
                setShowDeleteModal(true);
              }}
            />
          </div>
        );
      }
    }
  ];

  return (
    <div className="px-6 pt-4 w-full h-full pb-16">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Users Table</h1>
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
          <AgGridReact rowData={users} columnDefs={columnDefs} pagination={true} />
        </div>
      )}

      {/* Modal for editing */}
      {selectedUser && (
        <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && userToDelete && (
      <ConfirmModal
        title="Delete User"
        description={`Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          await dispatch(deleteUser(userToDelete.id));
          toast.success("User deleted successfully!");
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
      />
    )}
    </div>
  );
}

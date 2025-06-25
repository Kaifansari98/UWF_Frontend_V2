"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchAllUsers } from "@/features/users/GetUsersSlice";
import { AgGridReact } from "ag-grid-react";
import { Pencil, Trash2 } from "lucide-react";
import { ColDef } from "ag-grid-community";

export default function UsersListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.getUsers);

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
      cellRenderer: () => {
        return (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Pencil
              size={18}
              style={{ color: "#292929", cursor: "pointer" }}
              onClick={() => {
                console.log("Edit clicked");
              }}
            />
            <Trash2
              size={18}
              style={{ color: "red", cursor: "pointer" }}
              onClick={() => {
                console.log("Delete clicked");
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
        <div className="ag-theme-alpine" style={{ height: "100%", width: "100%", }}>
          <AgGridReact rowData={users} columnDefs={columnDefs} pagination={true} />
        </div>
      )}
    </div>
  );
}

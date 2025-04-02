'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { systemApi } from "../api/apiService";
import { TextField, Button, Typography } from '@mui/material';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Check if username and password are provided
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    
    const response = await systemApi.login(username, password);
    
    if (response.token) {
      localStorage.setItem("token", response.token); // Save token
      router.push("/"); // Redirect to dashboard
    } else {
      setError(response.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <Typography variant="h2">ログイン</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          type="text"
          className="input-field"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" className="login-button" variant="contained" color="primary">Login</Button>
      </form>
      {error && <Typography className="error-message" color="error">{error}</Typography>}
    </div>
  );
}
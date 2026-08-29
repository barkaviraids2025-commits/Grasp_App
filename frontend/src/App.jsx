import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getToken } from "./api";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Schedule from "./pages/Schedule";
import Learn from "./pages/Learn";
import Progress from "./pages/Progress";
import Badges from "./pages/Badges";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import FocusLab from "./pages/FocusLab";
import Courses from "./pages/Courses";

function Gate({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const loc = useLocation();
  void loc;
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Gate>
            <Layout />
          </Gate>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/schedule/:id" element={<Schedule />} />
        <Route path="/learn/:conceptId" element={<Learn />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/focus" element={<FocusLab />} />
      </Route>
    </Routes>
  );
}

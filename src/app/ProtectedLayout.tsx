import { Outlet, Navigate } from "react-router-dom";
import { useAppSelector } from "../features/store";
import Layout from "../layouts/Layout";

const ProtectedLayout: React.FC = () => {
    const { isLoggedIn } = useAppSelector((state) => state.auth);
    return (isLoggedIn ? <Layout><Outlet /></Layout> : <Navigate to='/login' />)
};

export default ProtectedLayout; 
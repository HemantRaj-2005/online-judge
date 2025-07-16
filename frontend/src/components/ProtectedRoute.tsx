import { useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function ProtectedRoute({children} : { children: React.ReactNode}){
    const {user} = useAppSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if(!user){
            navigate("/sign-in");
        }else if(!user.isVerified){
            navigate("/resend-verification");
        }
    }, [user,navigate]);

    return(
        <>
        {children}
        </>
    );
}
import { useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function AuthorProtectedRoute({children} : { children: React.ReactNode}){
    const {user} = useAppSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if(!user){
            navigate("/login");
        }else if(!user.isVerified){
            navigate("/verify-email");
        } else if(!user.isAuthor){
            navigate("/")
        }
    }, [user,navigate]);

    return(
        <>
        {children}
        </>
    );
}
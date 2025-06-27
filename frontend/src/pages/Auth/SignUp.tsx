import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

export default function SignUp() {
    
    const [formData, setFormData] = useState({
        username : "",
        email: "",
        password: "",
        institution: "",
        bio: "",
    });

    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}))
    };

    const handleSignUp = async () => {
        try{
            const response = await fetch( "http://localhost:8000/api/users/register/", {
                method: "POST",
                headers: { "Content-Type" : "application/json" },
                // credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if(response.ok){
                toast.success("Registration Successfull",{
                    description: data.message || "Account created successfully, check mail for verification",
                });

                setTimeout(() => {
                    navigate(`/dashboard/${formData.username}`)
                }, 2000)


            } else {
                const errorMessage = Object.values(data).flat().join(" ") || "Failed to create account.";
                toast.error("Registration failed", {
                    description: errorMessage,
                });
            }

        } catch(error){
            toast.error("Unexpected Error", {
                description: "An unexpected error occured. Please try again later.",
            })
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-translucent">
            <CardHeader>
                <CardTitle>Create Your Account to get started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              name="institution"
              type="text"
              placeholder="Enter your institution (optional)"
              value={formData.institution}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself (optional)"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full cursor-pointer" onClick={handleSignUp}>
            Sign Up
          </Button>
        </CardFooter>
        </Card>
        <Toaster />
    </div>
  )
}

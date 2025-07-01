import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { toast } from "sonner";
import Loading from "../../components/Loading";

const Login = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const { currentUser, login } = useAuth();

  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (!email || !password) {
      return setErrMessage("Please fill required fields");
    }
    const res = await login(email, password);
    if (res.success) {
      toast.success(`${currentUser?.name} logged in successfully!`);
      setLoading(true);
      navigate("/my-events");
      setLoading(false);
    } else {
      console.error(res.message);
      toast.error(res.message);
      setErrMessage(res.message);
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center my-8 text-dark">
        <div className="text-center grid gap-4 px-4">
          <p className="text-prim2">Welcome Back!</p>
          <p className="font-bold text-2xl md:text-4xl">Member Login</p>
          <p>Sign in now and enjoy access to all the features.</p>
        </div>
        <div className="grid min-w-80 md:min-w-96 my-4 px-4">
          <form
            onSubmit={handleLogin}
            className="flex flex-col justify-center w-full"
          >
            <div>
              <p className="my-2 font-medium">Email</p>
              <input
                className="rounded-md px-4 py-2.5 border w-full"
                type="email"
                name="email"
                placeholder="Email Address"
                required
              />
            </div>
            <div className="relative">
              <p className="my-2 font-medium">Password</p>
              <input
                className="rounded-md px-4 py-2.5 border w-full"
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
              />
              <div
                onClick={handleShowPass}
                className="absolute right-2.5 top-11 p-2.5 cursor-pointer"
              >
                {showPass ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
            <input
              className="rounded-md px-4 py-2.5 border my-5 cursor-pointer text-dark font-black bg-[#ffbe58] hover:shadow-lg transition-all"
              type="submit"
              value="Sign In"
            />
          </form>
          <p className="text-center text-sm">
            Don't have an account? Please{" "}
            <Link
              to="/signup"
              className="underline hover:text-yellow-600 font-medium"
            >
              Register Here
            </Link>
          </p>
          <p className="my-2 text-center text-sm font-semibold text-red-600">
            {errMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

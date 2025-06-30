import React from "react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthProvider";
import Loading from "../../components/Loading";
import axios from "axios";

const Signup = () => {
  const [showPass, setShowPass] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleShowPass = () => {
    setShowPass(!showPass);
  };

  const checkSix = /^(?=.{6,})/;
  const checkUpper = /^(?=.*[A-Z])/;
  const checkNumber = /^(?=.*\d)/;

  const handleSignUp = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const pic = e.target.photo.value;

    const newUser = {
      name,
      email,
      password,
      photoUrl: pic,
      joinedEvents: [],
    };

    if (!checkNumber.test(password)) {
      setErrMessage("Password must have at least one number.");
      toast.error("Password must have at least one number.");
      return;
    }

    if (!checkUpper.test(password)) {
      setErrMessage("Password must have at least 1 uppercase letter.");
      toast.error("Password must have at least 1 uppercase letter.");
      return;
    }

    if (!checkSix.test(password)) {
      setErrMessage("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setErrMessage("");
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/signup`, newUser, {withCredentials: true});

      if (res.data?.user) {
        setCurrentUser(res.data.user);
        toast.success("Successfully Signed Up!");
        navigate("/events");
      } else {
        setErrMessage("Signup failed.");
        toast.error("Signup failed.");
      }
    } catch (err) {
      setErrMessage(err.response?.data?.message || "Something went wrong.");
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center my-8 text-dark">
        <div className="text-center grid gap-4 px-4">
          <p className="text-prim2">Sign Up</p>
          <p className="font-bold text-2xl md:text-4xl">Start for free Today</p>
          <p>Access to all features. No credit card required.</p>
        </div>
        <div className="grid min-w-80 md:min-w-96 my-4 px-4">
          <form
            onSubmit={handleSignUp}
            className="flex flex-col justify-center w-full"
          >
            <div>
              <p className="my-2 font-medium">Name</p>
              <input
                className="rounded-md px-4 py-2.5 border w-full"
                type="text"
                name="name"
                placeholder="Enter Your Name"
                required
              />
            </div>
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
                className="absolute right-3 top-11 p-2.5 cursor-pointer"
              >
                {showPass ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
            <div>
              <p className="my-2 font-medium">Photo</p>
              <input
                className="rounded-md px-4 py-2.5 border w-full"
                type="url"
                name="photo"
                placeholder="Photo-URL"
                required
              />
            </div>
            <input
              className="rounded-md px-4 py-2.5 border my-5 cursor-pointer text-dark font-black bg-[#ffbe58] hover:shadow-lg transition-all"
              type="submit"
              value="Sign Up"
            />
          </form>
          <p className="text-center text-sm">
            Already have an account? Please{" "}
            <Link
              to="/signin"
              className="underline hover:text-yellow-600 font-medium"
            >
              Sign In
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

export default Signup;

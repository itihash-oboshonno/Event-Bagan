import React, { useContext, useState } from "react";
import navlogo from "../assets/eventbagan.webp";
import { Link, NavLink, useLocation } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";

const Navbar = () => {
  const location = useLocation();
  const atHomePage = location.pathname === "/";
  const { currentUser, logout } = useAuth();

  const navItems = (
    <>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-dark underline decoration-red-700 decoration-4 lg:underline-offset-8"
              : "font-medium text-dark hover:text-red-600"
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/add-event"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-dark underline decoration-red-700 decoration-4 lg:underline-offset-8"
              : "font-medium text-dark hover:text-red-600"
          }
        >
          Add Event
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/events"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-dark underline decoration-red-700 decoration-4 lg:underline-offset-8"
              : "font-medium text-dark hover:text-red-600"
          }
        >
          Events
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/my-events"
          className={({ isActive }) =>
            isActive
              ? "font-bold text-dark underline decoration-red-700 decoration-4 lg:underline-offset-8"
              : "font-medium text-dark hover:text-red-600"
          }
        >
          My Events
        </NavLink>
      </li>
    </>
  );

  return (
    <div className={atHomePage ? "bg-[#ffd0d0]" : "bg-white shadow"}>
      <nav className="flex justify-between items-center max-w-screen-2xl mx-auto px-4 py-4">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img className="max-w-8 md:max-w-16 mx-auto" src={navlogo} alt="" />
            <p className="font-bold text-2xl">Event Bagan</p>
          </Link>
        </div>
        <div>
          <ul className="hidden lg:flex items-center gap-8">{navItems}</ul>
        </div>
        <div className="">
          {currentUser ? (
            <>
              <div className="p-1 rounded-xl flex items-center gap-1 md:gap-4">
                <div
                  className="tooltip tooltip-bottom"
                  data-tip={currentUser?.name}
                >
                  <img
                    className="rounded-full w-8 h-8 md:w-10 md:h-10 object-cover"
                    src={currentUser?.photoUrl}
                    alt=""
                  />
                </div>
                <Link to="/">
                  <button
                    onClick={logout}
                    className="text-white text-sm md:text-base md:font-semibold bg-red-700 px-3 py-2 md:px-6 md:py-2.5 rounded-full hover:shadow-lg hover:bg-red-600 transition-all"
                  >
                    Logout
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="text-black text-sm md:text-base md:font-semibold bg-[#ffbe58] px-4 py-2 md:px-6 md:py-2.5 rounded-full hover:shadow-lg hover:bg-red-600 transition-all">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="text-black text-sm md:text-base md:font-semibold bg-[#ffbe58] px-3 py-2 md:px-6 md:py-2.5 rounded-full hover:shadow-lg hover:bg-red-600 transition-all">
                    Sign Up
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="flex lg:hidden ml-3">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button">
              <div>
                <FaBars className="text-dark"></FaBars>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              {navItems}
            </ul>
          </div>
        </div>
      </nav>
      <Toaster position="top-center" expand={false} richColors />
    </div>
  );
};

export default Navbar;

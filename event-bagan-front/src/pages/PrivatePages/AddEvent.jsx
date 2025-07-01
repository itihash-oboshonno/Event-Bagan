import React, { useState } from "react";
import DatePicker from "react-datepicker";
import TimePicker from "react-time-picker";
import { format, parse } from "date-fns";
import { useAuth } from "../../context/AuthProvider";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";

const AddEvent = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("10:00");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const eDate = format(date, "yyyy-MM-dd");
  const eDnT = `${eDate} ${time}`;
  const isoEDT = parse(eDnT, "yyyy-MM-dd HH:mm", new Date());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const title = e.target.title.value;
    const name = currentUser?.name;
    const email = currentUser?.email;
    const dnt = isoEDT;
    const location = e.target.location.value;
    const description = e.target.description.value;
    const attendeeCount = parseFloat(0);

    const newEvent = {
      title,
      name,
      email,
      dnt,
      location,
      description,
      attendeeCount,
    };

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/events`, newEvent, {
        withCredentials: true,
      });
      if (data) {
        toast.success("Created Event Successfully.");
        navigate("/events");
      }
    } catch (err) {
      console.log(err);
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <div className="py-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-screen-lg mx-auto bg-white p-8 border rounded-md shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-black text-dark text-center">
          Create a New Event
        </h2>

        <div className="flex flex-col md:flex-row gap-5 justify-center w-full">
          <div className="w-full">
            <p className="pb-1 font-medium">Title</p>
            <input
              type="text"
              name="title"
              placeholder="Enter Session Title"
              className="rounded-md border p-2 focus:outline-none focus:ring focus:ring-[#ffbe58] w-full"
              required
            />
          </div>
        </div>

        <div>
          <p className="pb-1 font-medium">Description</p>
          <textarea
            type="text"
            name="description"
            placeholder="Write session description..."
            className="min-h-20 rounded-md border p-2 focus:outline-none focus:ring focus:ring-[#ffbe58] w-full"
            required
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-center justify-center">
          {/* Event Date and Time */}
          <div className="flex flex-col w-full">
            <label className="mb-1 font-medium">Event Date and Time</label>
            <div className="flex justify-center items-center gap-2">
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-[#ffbe58]"
              />
              <TimePicker
                onChange={setTime}
                value={time}
                format="h:mm a"
                className="w-full p-1.5 border rounded-md focus:outline-none focus:ring focus:ring-[#ffbe58]"
                disableClock
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label className="mb-1 font-medium">Location</label>
            <div className="flex justify-center items-center">
              <input
                type="text"
                name="location"
                placeholder="Enter Event Location"
                className="rounded-md border p-2 focus:outline-none focus:ring focus:ring-[#ffbe58] w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Tutor Creds */}
        <div className="flex flex-col md:flex-row gap-5 items-center justify-center">
          <div className=" w-full">
            <p className="pb-1 font-medium">Host Name</p>
            <p className="rounded-md border border-green px-4 py-2 bg-[#ffbe58] bg-opacity-20">
              {currentUser?.name}
            </p>
          </div>
          <div className=" w-full">
            <p className="pb-1 font-medium">Host Email</p>
            <p className="rounded-md border border-green px-4 py-2 bg-[#ffbe58] bg-opacity-20">
              {currentUser?.email}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="rounded-md px-4 py-2.5 border my-5 cursor-pointer text-dark font-black bg-[#ffbe58] hover:shadow-lg transition-all"
          >
            Add Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;

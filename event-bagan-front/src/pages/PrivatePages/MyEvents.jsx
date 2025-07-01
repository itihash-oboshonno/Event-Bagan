import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import axios from "axios";

const MyEvents = () => {
  const { currentUser } = useAuth();
  const [created, setCreated] = useState([]);
  const [joined, setJoined] = useState([]);

  const myCreatedEvents = async () => {
    try {
      const { data } = await axios(
        `${import.meta.env.VITE_API_URL}/myevents/${currentUser?.email}`
      );
      setCreated(data);
    } catch (err) {
      console.log(err);
    }
  };

  const myJoinedEvents = async () => {
    try {
      const { data } = await axios(
        `${import.meta.env.VITE_API_URL}/myjoinedevents/${currentUser?.email}`
      );
      setJoined(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    myCreatedEvents();
    myJoinedEvents();
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-4">
      <div>
        <p className="text-4xl font-bold py-8">My Created Events</p>
        <div>
          <div className="grid grid-cols-3 gap-5 items-center justify-center max-w-screen-2xl mx-auto py-10 px-4">
            {created?.map((each, index) => (
              <div key={index}>
                <div className="p-4 rounded-md shadow-md">
                  <p className="font-semibold text-xl">{each?.title}</p>
                  <p>
                    Host Name: <span className="font-medium">{each?.name}</span>
                  </p>
                  <p>
                    Host Email:{" "}
                    <span className="font-medium">{each?.email}</span>
                  </p>
                  <p>Event Location: {each?.location}</p>
                  <p>
                    Event Date:{" "}
                    <span>{new Date(each?.dnt).toDateString()}</span>
                  </p>
                  <p>
                    Event Time:{" "}
                    <span>{new Date(each?.dnt).toTimeString()}</span>
                  </p>
                  <p>
                    Attendees:{" "}
                    <span className="font-medium">{each?.attendeeCount}</span>
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button className="bg-[#ffbe58] hover:shadow-lg text-black font-semibold px-8 py-2 rounded-md">
                      Edit
                    </button>
                    <button className="bg-red-700 hover:bg-red-600 text-white font-semibold px-8 py-2 rounded-md">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <hr />
      <div>
        <p className="text-4xl font-bold py-8">My Joined Events</p>
        <div>
          <div className="grid grid-cols-3 gap-5 items-center justify-center max-w-screen-2xl mx-auto py-10 px-4">
            {joined?.map((each, index) => (
              <div key={index}>
                <div className="p-4 rounded-md shadow-md">
                  <p className="font-semibold text-xl">{each?.title}</p>
                  <p>
                    Host Name: <span className="font-medium">{each?.name}</span>
                  </p>
                  <p>
                    Host Email:{" "}
                    <span className="font-medium">{each?.email}</span>
                  </p>
                  <p>Event Location: {each?.location}</p>
                  <p>
                    Event Date:{" "}
                    <span>{new Date(each?.dnt).toDateString()}</span>
                  </p>
                  <p>
                    Event Time:{" "}
                    <span>{new Date(each?.dnt).toTimeString()}</span>
                  </p>
                  <p>
                    Attendees:{" "}
                    <span className="font-medium">{each?.attendeeCount}</span>
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button className="bg-red-700 hover:bg-red-600 text-white font-semibold px-8 py-2 rounded-md">
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEvents;

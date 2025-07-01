import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import Loading from "../../components/Loading";
import { toast } from "sonner";

const Events = () => {
  const { currentUser } = useAuth();
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: user = [], isLoadingg } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await axios(
        `${import.meta.env.VITE_API_URL}/users/${currentUser?.email}`,
        { withCredentials: true }
      );
      return data;
    },
  });

  const {
    data: allevents = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["allevents"],
    queryFn: async () => {
      const { data } = await axios(
        `${import.meta.env.VITE_API_URL}/allevents`,
        {
          params: {
            searchText,
            filterType,
          },
        }
      );
      return data;
    },
  });

  useEffect(() => {
    refetch();
  }, [searchText, filterType]);

  const handleJoin = async (id) => {
    try {
      setLoading(true);

      const usersArrayUp = axios.patch(
        `${import.meta.env.VITE_API_URL}/usersjoinedincrease/${user?._id}`,
        { eventId: id },
        { withCredentials: true }
      );

      const eventsCountUp = axios.patch(
        `${import.meta.env.VITE_API_URL}/eventscountincrement/${id}`,
        { withCredentials: true }
      );

      await Promise.all([usersArrayUp, eventsCountUp]);

      window.location.reload();
      toast.success("Session Updated Successfully");
    } catch (err) {
      console.log(err);
    } finally {
      refetch();
      setLoading(false);
    }
  };

  if (loading || isLoading) return <Loading></Loading>;

  return (
    <div className="grid grid-cols-3 gap-5 items-center justify-center max-w-screen-2xl mx-auto py-10 px-4">
      {allevents?.map((each, index) => (
        <div key={index}>
          <div className="p-4 rounded-md shadow-md">
            <p className="font-semibold text-xl">{each?.title}</p>
            <p>
              Host Name: <span className="font-medium">{each?.name}</span>
            </p>
            <p>
              Host Email: <span className="font-medium">{each?.email}</span>
            </p>
            <p>Event Location: {each?.location}</p>
            <p>
              Event Date: <span>{new Date(each?.dnt).toDateString()}</span>
            </p>
            <p>
              Event Time: <span>{new Date(each?.dnt).toTimeString()}</span>
            </p>
            <div>
              {currentUser?.email === each?.email ? (
                <>
                  <button
                    disabled
                    className="bg-[#ffbe58] bg-opacity-20 text-yellow-500 font-semibold px-8 py-2 rounded-md"
                  >
                    You're the Host!
                  </button>
                </>
              ) : (
                <>
                  <div>
                    {user?.joinedEvents?.some(
                      (id) => id.toString() === each._id.toString()
                    ) ? (
                      <>
                        <button
                          disabled
                          className="bg-gray-300 text-gray-600 px-8 py-2 rounded-md"
                        >
                          Joined
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoin(each?._id)}
                        className="bg-red-700 text-white hover:bg-red-600 px-8 py-2 rounded-md"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Events;

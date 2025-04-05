import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider, Contract } from "ethers";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";






const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function Dashboard() {


    return (

        <main className=" min-h-screen w-full">
            <Navbar />
            <div className="w-full flex">
                <div className=" w-1/4">
                    <Sidebar />
                </div>
                <div className=" flex  h-screen w-full flex-1  items-center justify-center" >
                    {/* for root */}
                </div>
            </div>

        </main>
    );
}

export default Dashboard;

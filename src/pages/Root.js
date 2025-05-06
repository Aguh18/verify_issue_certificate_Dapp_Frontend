import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { BrowserProvider, Contract } from "ethers";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";







const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function Root() {


    return (

        <main className="h-screen w-full flex flex-col">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/5 min-h-full">
                    <Sidebar />
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    <Outlet />
                </div>
            </div>
        </main>

    );
}

export default Root;

"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteCustomerPet } from "../actions/customer-pet-actions";
export function DeletePetButton({publicIdentifier}:{publicIdentifier:string}){const router=useRouter();const[pending,start]=useTransition();return <button className="mt-4 min-h-11 rounded-full border border-rose-200 px-4 text-sm font-semibold text-rose-800 disabled:opacity-50" disabled={pending} onClick={()=>{if(!window.confirm("Delete this pet? This cannot be undone."))return;start(async()=>{try{await deleteCustomerPet(publicIdentifier);router.push("/account/pets");router.refresh();}catch{window.alert("We couldn't delete this pet because it has linked records.");}})}}>{pending?"Deleting…":"Delete pet"}</button>}

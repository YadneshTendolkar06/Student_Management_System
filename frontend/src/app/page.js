"use client"
import React,{useEffect, useState} from 'react'
import axios from 'axios'

function Page() {

  const [data,setData] = useState([])
  const [newStudentData, setNewStudentData] = useState({name: '',class: '', roll_number: ''})
  const [editable,setEditable] = useState(false)
  const [editableData,setEditableData] = useState()

  const fetchData = async()=>{
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}`)
      setData(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  function handleInput(e){
    const {value, name} = e.target
    setNewStudentData({...newStudentData, [name]: value})
  }

  const handleAddData = async (e) => {
    e.preventDefault();
    if (editable && editableData) {
        try {
            // Update the data on the server
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/${editableData.id}`, newStudentData);

            // Fetch updated data after the update
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}`);
            setData(response.data);

            // Clear the form and reset state
            setEditable(false);
            setNewStudentData({ name: '', class: '', roll_number: '' });

        } catch (error) {
            console.error("Error updating data:", error);
            if (error.response && error.response.status === 409) {
                alert('Record already exists with the same class and roll number');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    } else {
        try {
            // Add new student data if not in edit mode
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}`, newStudentData);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}`);
            setData(response.data);

            // Reset the form after adding the student
            setNewStudentData({ name: '', class: '', roll_number: '' });
            setEditable(false);

        } catch (error) {
            console.error("Error adding data:", error);
            if (error.response && error.response.status === 409) {
                alert('Record already exists with the same class and roll number');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    }
};


  const handleDeleteButton = async(id)=>{
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/${id}`)
      fetchData()
    } catch (error) {
      console.log(error)
    }
  }

  const handleEdit = (id)=>{
    const studData = data.find(item => item.id === id)
    setEditableData(studData)
    setEditable(true);
  }

  useEffect(()=>{
    if(editableData){
      setNewStudentData({name: editableData.name,class: editableData.class, roll_number: editableData.roll_number})
      setEditable(true)
    }
  },[editableData])

  useEffect(()=>{
    fetchData()
  },[])
    return (
      <>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white text-black mx-7 p-8 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-bold text-center mb-6">Student Form</h2>
            <form onSubmit={handleAddData}>
            <div className="mb-4">
                <label
                className="block text-gray-700 font-medium mb-2"
                >
                Name
                </label>
                <input
                type="text"
                value={newStudentData.name}
                name="name"
                id="name"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Student name"
                onChange={handleInput}
                required={true}
                />
            </div>
            <div className="mb-4">
                <label
                className="block text-gray-700 font-medium mb-2"
                >
                Class
                </label>
                <input
                type="text"
                name='class'
                value={newStudentData.class}
                id="class"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Student class"
                onChange={handleInput}
                required={true}
                />
            </div>
            <div className="mb-4">
                <label
                className="block text-gray-700 font-medium mb-2"
                >
                Roll number
                </label>
                <input
                type="text"
                name="roll_number"
                value={newStudentData.roll_number}
                id="roll number"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Student roll number"
                onChange={handleInput}
                required={true}
                />
            </div>
            <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
            >
                {editable ? "Edit Data" : "Add Data"}
            </button>
            </form>
        </div>


        {/* display Table */}
        <div className='flex justify-center h-full'>
        <table style={{ border: "1px solid black", borderCollapse: "collapse" }}className="border-2 h-52 content-center w-auto">
        <thead>
            <tr className=''>
              <th className='border-2 px-7 border-black'>index</th>
              <th className='border-2 px-7 border-black'>Roll Number</th>
              <th className='border-2 px-7 border-black'>Student Name</th>
              <th className='border-2 px-7 border-black'>Class</th>
              <th className='border-2 px-7 border-black'>Edit</th>
              <th className='border-2 px-7 border-black'>Remove</th>
            </tr>
        </thead>
            <tbody >
              {data.map((item,index) =>
                <tr className='text-center ' key={item.id}>
                <td className='border-2 px-7 border-black'>{index + 1}</td>
                <td className='border-2 px-7 border-black'>{item.roll_number}</td>
                <td className='border-2 px-7 border-black'>{item.name}</td>
                <td className='border-2 px-7 border-black'>{item.class}</td>
                <td className='border-2 px-7 border-black'>
                <button onClick={()=> handleEdit(item.id)} className='bg-blue-500 px-5 rounded-lg py-2'>Edit</button>
                </td>
                <td className='border-2 px-7 border-black'>
                <button onClick={()=> handleDeleteButton(item.id)} className='bg-red-500 px-3 rounded-lg py-3'>Remove</button>
                </td>
            </tr>
            )}
            </tbody>
        </table>
        </div>
        </div>
      </>
    )
}

export default Page

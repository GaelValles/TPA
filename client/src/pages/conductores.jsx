import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SidePage from "../components/sidebar";
import { useAuth } from "../context/auth.context";
import Swal from 'sweetalert2';

function ConductoresPage() {
    const { user, getConductors } = useAuth();
    const [conductores, setConductores] = useState([]);
    const [selectedConductores, setSelectedConductores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchConductores = async () => {
            const conductoresData = await getConductors();
            setConductores(conductoresData.filter(conductor => conductor.estatus !== false));
        };
        fetchConductores();
    }, []);

    const handleDelete = async () => {
        if (selectedConductores.length === 0) {
            Swal.fire({
                title: 'Atención',
                text: 'Debes seleccionar al menos un conductor para eliminar.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminarán los conductores seleccionados",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all(selectedConductores.map(async (idconductor) => {
                        await deleteConductorRequest(idconductor);
                    }));
                    const updatedConductores = conductores.filter(conductor => !selectedConductores.includes(conductor._id));
                    setConductores(updatedConductores);
                    setSelectedConductores([]);
                    Swal.fire(
                        'Eliminados!',
                        'Los conductores seleccionados han sido eliminados.',
                        'success'
                    );
                } catch (error) {
                    console.error("Error al eliminar conductores:", error);
                    Swal.fire(
                        'Error!',
                        'Ocurrió un error al intentar eliminar los conductores seleccionados.',
                        'error'
                    );
                }
            }
        });
    };

    const handleCheckboxChange = (idconductor) => {
        setSelectedConductores(prevSelected => {
            if (prevSelected.includes(idconductor)) {
                return prevSelected.filter(id => id !== idconductor);
            } else {
                return [...prevSelected, idconductor];
            }
        });
    };

    const filteredConductores = conductores.filter((conductor) =>
        conductor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.numGafete.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.numLicencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.numVisa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex">
            <SidePage />
            <div className="flex-1 p-6 lg:ml-[300px]">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl text-black">Conductores</h1>
                    <div className="flex items-center space-x-2 p-2 rounded">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-l-transparent border-blue-500 border-r-transparent border-t-transparent border-b-2 border-solid mt-3 mr-2"
                            style={{ width: '400px' }}
                        />
                        <button className="text-gray-500">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="bi bi-download flex items-center bg-green-500 text-white h-10 mt-3 py-2 px-4 rounded-full hover:bg-green-600 mr-2"></button>
                        <button className="bi bi-arrow-clockwise flex items-center bg-blue-500 text-white h-10 mt-3 py-2 px-4 rounded-full hover:bg-blue-600 mr-2">Actualizar</button>
                        <button onClick={handleDelete} className="bi bi-trash flex items-center bg-red-500 text-white h-10 mt-3 py-2 px-4 rounded-full hover:bg-red-600 mr-2"> Eliminar</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredConductores.length === 0 ? (
                        <div className="text-center text-gray-600 mt-8 mb-4 text-2xl font-bold">No se ha encontrado ningún conductor</div>
                    ) : (
                        <>
                            {filteredConductores.map((conductor) => (
                                <div key={conductor._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
                                    <div>
                                        <h1 className="text-xl font-semibold">{conductor.nombre} {conductor.numGafete}</h1>
                                        <p className="text-gray-600">{conductor.numLicencia}</p>
                                        <p className="text-gray-600">{conductor.numVisa}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded-xl mr-2" 
                                            onChange={() => handleCheckboxChange(conductor._id)}
                                            checked={selectedConductores.includes(conductor._id)}
                                        />
                                        <Link to={`/editar-conductor/${conductor._id}`} className="text-blue-500">
                                            <i className="bi bi-pencil"></i>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            <Link to="/registrar" className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-center items-center text-blue-500">
                                <i className="bi bi-plus-lg text-4xl"></i>
                                <span>Agregar Conductor</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ConductoresPage;

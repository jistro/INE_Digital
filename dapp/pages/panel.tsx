import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { useState, useEffect, use } from 'react';
import { useAccount } from 'wagmi';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core';

import { ContractFunctionExecutionError } from 'viem';

import InstitutoNacionalElectoral from '../abis/InstitutoNacionalElectoral.json';


const direccionPrincipal = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const handleError = (error: any) => {
    if (error instanceof ContractFunctionExecutionError) {
        if (error.message.includes("InstitutoNacionalElectoral__AccesoDenegado()")) {
            alert(`Acceso denegado`);
        } else if (error.message.includes("InstitutoNacionalElectoral__AccesoDenegado_NoEsAdministrador()")) {
            alert(`Acceso denegado, no eres administrador`);
        } else if (error.message.includes("InstitutoNacionalElectoral__AccesoDenegado_NoEsEmpleado()")) {
            alert(`Acceso denegado, no eres empleado`);
        } else if (error.message.includes("InstitutoNacionalElectoral__RolInvalido()")) {
            alert(`Rol invalido`);
        } else if (error.message.includes("InstitutoNacionalElectoral__EmpleadoYaRegistrado()")) {
            alert(`El empleado ya está registrado`);
        } else if (error.message.includes("InstitutoNacionalElectoral__EmpleadoNoRegistrado()")) {
            alert(`El empleado no está registrado`);
        } else if (error.message.includes("InstitutoNacionalElectoral__NoAutoBaja()")) {
            alert(`No puedes darte de baja a ti mismo`);
        } else if (error.message.includes("InstitutoNacionalElectoral__EmpleadoDadoDeBaja()")) {
            alert(`El empleado ya está dado de baja`);
        } else if (error.message.includes("InstitutoNacionalElectoral__EmpleadoDadoDeAlta()")) {
            alert(`El empleado ya está dado de alta`);
        } else {
            alert("Ocurrió un error en el contrato");
        }
    } else {
        alert("Ocurrió un error al interactuar con el contrato.");
    }
    console.error("Error:", error);
};

const handleTxError = (error: any) => {
    if (error instanceof Error) {
        alert("Acción cancelada por el usuario.");
    }
    console.error("Error:", error);
};

const SuccessMessage = ({ message = '', txHash = '', clearTxHashes }: { message?: string; txHash?: string; clearTxHashes: () => void }) => (
    <div className={styles.success}>
        <h2>{message}</h2>
        <p className={styles.txHash}>{`tx hash: ${txHash}`}</p>
        <button className={styles.okButton} onClick={clearTxHashes}>OK</button>
    </div>
);


const Home: NextPage = () => {


    const UserInfo = ({ address = '', nombre = '', status = false, rol = 0, }: { address?: string; nombre?: string; status?: boolean; rol?: number; }) => (
        <>
            {rol === 0 ? (
                <>
                    <h2>Empledado no registrado</h2>
                    <p> Cambie de cuenta o comunícate con tu administrador </p>
                    <p>Firma publica: <span className={styles.addressText}>{address}</span></p>
                    <button className={styles.button__confirmAction} onClick={() => window.location.href = '/'}>Salir</button>
                </>
            ) : (
                <>
                    <h2>Mis datos</h2>
                    <p>Firma publica: <span className={styles.addressText}>{address}</span></p>
                    <p>{`Nombre: ${nombre}`}</p>
                    {status ? (
                        <p>{`Rol: ${rol === 1 ? 'Administrador' : 'Empleado'
                            }`}</p>
                    ) : (
                        <p>Dado de baja</p>
                    )}
                </>
            )}

        </>
    );

    const [isClient, setIsClient] = useState(false);
    const [userConected, setUserConected] = useState<any>(null);
    const { address, isConnected } = useAccount();
    const [txHashes, setTxHashes] = useState<any[]>([]);
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isConnected) {
            readContract({
                address: direccionPrincipal,
                abi: InstitutoNacionalElectoral.abi,
                account: address,
                functionName: 'verDatosPersonales',
                args: [],
            }).then((res) => {
                setUserConected(res);
            });
        } else {
            setUserConected(null);
        }
    }, [isConnected, address]);

    const newEmployee = () => {
        const inputIds = [
            "newEmployee_address",
            "newEmployee_name",
            "newEmployee_rol",
            "newEmployee_rfc",
            "newEmployee_phone",
            "newEmployee_email"
        ];
        const inputs = inputIds.map(id => document.getElementById(id) as HTMLInputElement);
        const values = inputs.map(input => {
            const value = input.value;
            input.value = "";
            return value;
        });
        if (values.includes("")) {
            alert("Ingresa todos los datos");
            return;
        }
        if (values[0].length !== 42) {
            alert("Ingresa una firma pública válida");
            return;
        }
        if (values[0] === address) {
            alert("No puedes usar tu propia firma pública");
            return;
        }
        const direccionEmpleado = values[0];
        const rolEmpleado = parseInt(values[2]);
        const nombre = values[1];
        const rfc = values[3];
        const telefono = values[4];
        const email = values[5];

        prepareWriteContract({
            address: direccionPrincipal,
            abi: InstitutoNacionalElectoral.abi,
            functionName: 'nuevoEmpleado',
            args: [direccionEmpleado, rolEmpleado, nombre, rfc, telefono, email],
        }).then((data) => {
            writeContract(data).then((data) => {
                setTxHashes([11, data.hash]);
            }).catch(handleTxError);
        }).catch(handleError);
    };

    const seeEmployeeData = () => {
        const inputId = "seeEmployeeData_address";
        const input = document.getElementById(inputId) as HTMLInputElement;
        const value = input.value;
        input.value = "";
        if (value === "") {
            alert("Ingresa la firma pública del empleado");
            return;
        }
        readContract({
            address: direccionPrincipal,
            abi: InstitutoNacionalElectoral.abi,
            functionName: 'verDatosEmpleado',
            account: address,
            args: [value],
        }).then((data) => {
            setTxHashes([12, data]);
            console.log(data);
        }).catch(handleError);
    };


    const fireEmployee = () => {
        const inputId = "fireEmployee_address";
        const input = document.getElementById(inputId) as HTMLInputElement;
        const value = input.value;
        input.value = "";
        if (value === "") {
            alert("Ingresa la firma pública del empleado");
            return;
        }
        if (value === address) {
            alert("No puedes darte de baja a ti mismo");
            return;
        }
        prepareWriteContract({
            address: direccionPrincipal,
            abi: InstitutoNacionalElectoral.abi,
            functionName: 'bajaEmpleado',
            args: [value],
        }).then((data) => {
            writeContract(data).then((data) => {
                setTxHashes([13, data.hash]);
            }).catch(handleTxError);
        }).catch(handleError);
    };

    const reinstateEmployee = () => {
        const inputIds = [
            "reinstateEmployee_address",
            "reinstateEmployee_rol"
        ];
        const inputs = inputIds.map(id => document.getElementById(id) as HTMLInputElement);
        const values = inputs.map(input => {
            const value = input.value;
            input.value = "";
            return value;
        }
        );
        if (values.includes("")) {
            alert("Ingresa todos los datos");
            return;
        }
        if (values[0] === address) {
            alert("No puedes darte de alta a ti mismo");
            return;
        }
        const rolNumber = parseInt(values[1]);
        prepareWriteContract({
            address: direccionPrincipal,
            abi: InstitutoNacionalElectoral.abi,
            functionName: 'recontratoEmpleado',
            args: [values[0], rolNumber],
        }).then((data) => {
            writeContract(data).then((data) => {
                setTxHashes([14, data.hash]);
            }).catch(handleTxError);
        }).catch(handleError);
    };

    const newCredencial = () => {
        const inputIds = [
            "newCredencial_address",
            "newCredencial_names",
            "newCredencial_firstName",
            "newCredencial_lastName",
            "newCredencial_claveElector",
            "newCredencial_curp",
            "newCredencial_rol"
        ];
        const inputs = inputIds.map(id => document.getElementById(id) as HTMLInputElement);
        const values = inputs.map(input => {
            const value = input.value;
            input.value = "";
            return value;
        }
        );
        if (values.includes("")) {
            alert("Ingresa todos los datos");
            return;
        }
        if (values[0].length !== 42) {
            alert("Ingresa una firma pública válida");
            return;
        }
        if (values[0] === address) {
            alert("No puedes usar tu propia firma pública");
            return;
        }
        //chechar si nombre tieen mayuscula en la primera letra
        if (values[1].match(/[A-Z]/) === null) {
            values[1] = values[1].charAt(0).toUpperCase() + values[1].slice(1);
        }
        if (values[2].match(/[A-Z]/) === null) {
            values[2] = values[2].charAt(0).toUpperCase() + values[2].slice(1);
        }
        if (values[3].match(/[A-Z]/) === null) {
            values[3] = values[3].charAt(0).toUpperCase() + values[3].slice(1);
        }

        const direccionCredencial = values[0];
        const nombres = values[1];
        const apellidoPaterno = values[2];
        const apellidoMaterno = values[3];
        const claveElector = values[4];
        const curp = values[5];
        const generoBiologico = parseInt(values[6]);

        prepareWriteContract({
            address: direccionPrincipal,
            abi: InstitutoNacionalElectoral.abi,
            functionName: 'crearCredencial',
            args: [direccionCredencial, nombres, apellidoPaterno, apellidoMaterno, claveElector, curp, generoBiologico],
        }).then((data) => {
            const idmexd = data.result;
            writeContract(data).then((data) => {
                setTxHashes([21, data.hash, idmexd]);
            }).catch(handleTxError);
        }).catch(handleError);
    };

    const setAddressCredencial = () => {
        const inputIds = [
            "setAddressCredencial_id",
            "setAddressCredencial_calle",
            "setAddressCredencial_numExterior",
            "setAddressCredencial_numInterior",
            "setAddressCredencial_colonia",
            "setAddressCredencial_cp",
            "setAddressCredencial_seccion"
        ];
        const inputs = inputIds.map(id => document.getElementById(id) as HTMLInputElement);
        const values = inputs.map(input => {
            const value = input.value;
            input.value = "";
            return value;
        }
        );
        values[3] = values[3] === "" ? "n/a" : values[3];
        if (values.includes("")) {
            alert("Ingresa todos los datos");
            return;
        }
        const idmexd = parseInt(values[0]);
        const calle = values[1];
        const numExterior = parseInt(values[2]);
        const numInterior = values[3];
        const colonia = values[4];
        const cp = parseInt(values[5]);
        const seccion = parseInt(values[6]);

        prepareWriteContract({
            address: direccionPrincipal,
            abi: InstitutoNacionalElectoral.abi,
            functionName: 'cambioDireccion',
            args: [idmexd, calle, numExterior, numInterior, colonia, cp, seccion],
        }).then((data) => {
            writeContract(data).then((data) => {
                setTxHashes([22, data.hash, idmexd]);
            }).catch(handleTxError);
        }).catch(handleError);
    };



    return (
        <div className={styles.container}>
            <Head>
                <title>RainbowKit App</title>
                <meta
                    content="Generated by @rainbow-me/create-rainbowkit"
                    name="description"
                />
                <link href="/favicon.ico" rel="icon" />
            </Head>

            <header className={styles.header}>
                <h1><img src="/logo-ine-st.png" alt="Logo" className={styles.header___logo} /> empleado</h1>
                <div>
                    <ConnectButton
                        label='Conectar a red'
                        showBalance={{
                            smallScreen: false,
                            largeScreen: true,
                        }}
                        accountStatus="address"
                        chainStatus={{
                            smallScreen: "none",
                            largeScreen: "icon",
                        }}
                    />
                </div>
            </header>


            <main className={styles.main}>
                <div className={styles.container__data}>
                    {isClient && isConnected ? (
                        <>
                            {userConected !== null && (
                                <UserInfo
                                    address={address}
                                    nombre={userConected.nombre}
                                    status={userConected.status}
                                    rol={userConected.areaTrabajo}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <p>Desconectado, por favor conectate en la parte superior</p>
                        </>
                    )}
                </div>
                {userConected !== null && userConected.areaTrabajo !== 0 && (
                    <>
                        {userConected.areaTrabajo === 1 && userConected.status ? (
                            <>
                                <div className={styles.container__twoSideByside}>
                                    {txHashes.length > 0 && txHashes[0] === 11 ? (
                                        <SuccessMessage message={'Empleado creado con éxito'} txHash={txHashes[1]} clearTxHashes={() => setTxHashes([])} />
                                    ) : (
                                        <div className={styles.container__leftSide}>
                                            <h2>Registrar empleado</h2>
                                            <input type="text" id="newEmployee_address" placeholder="Firma pública" />
                                            <input type="text" id="newEmployee_name" placeholder="Nombre" />
                                            <select id="newEmployee_rol" className={styles.newEmployee__select}>
                                                <option value="" disabled selected>Seleccciona</option>
                                                <option value='1'>Admin</option>
                                                <option value='2'>Empleado</option>
                                            </select>
                                            <input type="text" id="newEmployee_rfc" placeholder="RFC" />
                                            <input type="phone" id="newEmployee_phone" placeholder="Teléfono" />
                                            <input type="email" id="newEmployee_email" placeholder="Email" />
                                            <button className={styles.button__confirmAction} onClick={newEmployee}>Crear</button>
                                        </div>
                                    )}


                                    <div className={styles.container__rightSide}>
                                        {txHashes !== null && txHashes[0] === 12 ? (
                                            <>
                                                <p><strong>Nombre: </strong>{txHashes[1].nombre}</p>
                                                <p><strong>Telefono: </strong>{txHashes[1].telefono}</p>
                                                <p><strong>Email: </strong>{txHashes[1].email}</p>
                                                <p><strong>Rol: </strong>{`${txHashes[1].areaTrabajo === 0 ? 'N/A' : txHashes[1].areaTrabajo === 1 ? 'Administrador' : 'Empleado'
                                                    }`}
                                                </p>
                                                {txHashes[1].status ? (
                                                    <>
                                                        <p><strong>Estatus: </strong>En servicio</p>
                                                        <p><strong>Fecha de alta: </strong>{txHashes[1].fechaAlta}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p><strong>Estatus: </strong>Dado de baja</p>
                                                        <p><strong>Fecha de baja: </strong>{txHashes[1].fechaBaja}</p>
                                                    </>
                                                )}
                                                <button className={styles.closeButton} onClick={() => setTxHashes([])}>Cerrar</button>
                                            </>
                                        ) : (
                                            <>
                                                <h2>Buscar empleado</h2>
                                                <input type="text" id="seeEmployeeData_address" placeholder="Firma pública" />
                                                <button className={styles.button__confirmAction} onClick={seeEmployeeData}>Ver</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.container__twoSideByside}>


                                    {txHashes.length > 0 && txHashes[0] === 13 ? (
                                        <SuccessMessage message={'Empleado dado de baja con éxito'} txHash={txHashes[1]} clearTxHashes={() => setTxHashes([])} />
                                    ) : (
                                        <div className={styles.container__leftSide}>
                                            <h2>Dar de baja a empleado</h2>
                                            <input type="text" id="fireEmployee_address" placeholder="Firma pública" />
                                            <button className={styles.button__confirmAction} onClick={fireEmployee}>Dar de baja</button>
                                        </div>
                                    )}
                                    {txHashes.length > 0 && txHashes[0] === 14 ? (
                                        <SuccessMessage message={'Empleado reintegrado con éxito'} txHash={txHashes[1]} clearTxHashes={() => setTxHashes([])} />
                                    ) : (
                                        <div className={styles.container__rightSide}>
                                            <h2>Reintegrar empleado</h2>
                                            <input type="text" id="reinstateEmployee_address" placeholder="Firma pública" />
                                            <select id="reinstateEmployee_rol" className={styles.newEmployee__select}>
                                                <option value="" disabled selected>Seleccciona</option>
                                                <option value='1'>Admin</option>
                                                <option value='2'>Empleado</option>
                                            </select>
                                            <button className={styles.button__confirmAction} onClick={reinstateEmployee}>Reintegrar</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : userConected.areaTrabajo === 2 && userConected.status && (

                            <>
                                <div className={styles.container__twoSideByside}>
                                    {txHashes.length > 0 && txHashes[0] === 21 ? (
                                        <SuccessMessage message={`Credencial creada con exito  IDMEXD ${txHashes[2]} Recuerda asignar su direccion`} txHash={txHashes[1]} clearTxHashes={() => setTxHashes([])} />
                                    ) : (
                                        <div className={styles.container__leftSide}>
                                            <h2>Crear credencial</h2>
                                            <input type="text" id="newCredencial_address" placeholder="Firma pública" />
                                            <input type="text" id="newCredencial_names" placeholder="Nombre(s)" />
                                            <input type="text" id="newCredencial_firstName" placeholder="Apellido Paterno" />
                                            <input type="text" id="newCredencial_lastName" placeholder="Apellido Materno" />
                                            <input type="text" id="newCredencial_claveElector" placeholder="Clave de elector" />
                                            <input type="text" id="newCredencial_curp" placeholder="CURP" />
                                            <select id="newCredencial_rol" className={styles.newEmployee__select}>
                                                <option value="" disabled selected>Genero biologico</option>
                                                <option value='1'>Hombre</option>
                                                <option value='2'>Mujer</option>
                                            </select>
                                            <button className={styles.button__confirmAction} onClick={newCredencial}>Crear</button>
                                        </div>
                                    )}
                                    {txHashes.length > 0 && txHashes[0] === 22 ? (
                                        <SuccessMessage message={`Direccion asignada a IDEMEX${txHashes[2]}`} txHash={txHashes[1]} clearTxHashes={() => setTxHashes([])} />
                                    ) : (
                                        <div className={styles.container__leftSide}>
                                            <h2>Asignar / Cambiar direccion</h2>
                                            <input type="number" id="setAddressCredencial_id" placeholder="Numero de credencial" />
                                            <input type="text" id="setAddressCredencial_calle" placeholder="Calle" />
                                            <input type="number" id="setAddressCredencial_numExterior" placeholder="Numero exterior" />
                                            <input type="text" id="setAddressCredencial_numInterior" placeholder="Numero interior (opcional)" />
                                            <input type="text" id="setAddressCredencial_colonia" placeholder="Colonia" />
                                            <input type="number" id="setAddressCredencial_cp" placeholder="Codigo postal" />
                                            <input type="number" id="setAddressCredencial_seccion" placeholder="Seccion" />
                                            <button className={styles.button__confirmAction} onClick={setAddressCredencial}>Crear</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}

            </main>

            <footer className={styles.footer}>
            </footer>
        </div>
    );
};

export default Home;

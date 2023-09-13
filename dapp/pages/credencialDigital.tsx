import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { useState, useEffect, use } from 'react';
import { useAccount } from 'wagmi';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core';

import { ContractFunctionExecutionError } from 'viem';

import InstitutoNacionalElectoral from '../abis/InstitutoNacionalElectoral.json';
import CredencialDigital from '../abis/CredencialDigital.json';

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
                <h1>Empleado no registrado</h1>
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
    const [idUser , setIdUser] = useState<any>(null);
    const { address, isConnected } = useAccount();
    const [txHashes, setTxHashes] = useState<any[]>([]);

    const [credencialAddress, setCredencialAddress] = useState<any>(null);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isConnected) {
            readContract({
                address: direccionPrincipal,
                abi: InstitutoNacionalElectoral.abi,
                //account: address,
                functionName: 'verAddressCredecialDigital',
                args: [],
            }).then((res) => {
                setCredencialAddress(res);
            });
        } else {
            setCredencialAddress(null);
        }
    }, [isConnected, address]);

    useEffect(() => {
        if (credencialAddress && isConnected) {
            readContract({
                address: credencialAddress,
                abi: CredencialDigital.abi,
                account: address,
                functionName: 'getIDwithSender',
                args: [],
            }).then((res) => {
                console.log(res);
                setIdUser(res);
            });
        }
    }
        , [isConnected,credencialAddress, address]);




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
            </header>


            <main className={styles.main}>
                    {isClient && isConnected && idUser && (
                    <div className={styles.container__card}>
                    { idUser.claveElector !== '' ? (
                        
                            <div className={styles.card_identidad}>
                                <p>Nombre: {idUser.identidad.nombre} {idUser.identidad.apellidoPaterno} {idUser.identidad.apellidoMaterno}</p>
                                <p>Clave de Elector: {idUser.claveElector}</p>
                                <p>CURP: {idUser.curp}</p>
                                <div className={styles.direccion}>
                                <p>Calle: {idUser.direccion.calle}</p>
                                <p>Número Exterior: {idUser.direccion.numeroExterior.toString()}</p>
                                {idUser.direccion.numeroInterior && <p>Número Interior: {idUser.direccion.numeroInterior}</p>}
                                <p>Colonia: {idUser.direccion.colonia}</p>
                                <p>Código Postal: {idUser.direccion.codigoPostal.toString()}</p>
                                <p>Sección: {idUser.direccion.seccion.toString()}</p>
                                </div>
                            </div>
                            
                        
                        ):(
                            <div className={styles.card_noData}>
                                <p>No hay una credencial digital asociada a esta cuenta</p>
                                <p>Por favor, cambie la cuenta en la que tiene asociada una credencial digital o solicita en tu modulo INE mas cercano una credencial digital.</p>
                            </div>
                        )}
                        </div>
                    )}
                    { idUser && idUser.claveElector !== '' && (
                            <div className={styles.container__twoSideByside}>
                                <div className={styles.container__leftSide}>
                                    <h2>Dar permiso</h2>
                                    <p>Firma publica del solicitante de acceso</p>
                                    <input id="newPermiso_address" className={styles.newEmployee__input} placeholder="Firma publica" />
                                    <p>Fecha de expiracion</p>
                                    <input type="date" id="newPermiso_fecha" className={styles.newEmployee__input} placeholder="Fecha de expiracion" />
                                    <p>Nivel de acceso</p>
                                    <select id="newPermiso_nivel" className={styles.newEmployee__select}>
                                                <option value="" disabled selected>Seleccciona un nivel de acceso</option>
                                                <option value='1'>Nivel de acceso 1</option>
                                                <option value='2'>Nivel de acceso 2</option>
                                                <option value='3'>Nivel de acceso 3</option>
                                    </select>
                                    <button className={styles.button__confirmAction}>
                                        Dar permiso
                                    </button>

                                </div>
                                <div className={styles.container__info}>
                                    <h2>Informacion</h2>
                                    <p>
                                        Tu credencial digital te permite dar acceso a tus datos personales a quien tu quieras mediante niveles de acceso.
                                    </p>
                                    <p>Existen varios niveles:</p>
                                    <br/>
                                    <strong>Nivel de acceso 1</strong>
                                    <p>Este nivel da acceso total a tus datos personales uselo con precaucion</p>
                                    <br/>
                                    <strong>Nivel de acceso 2</strong>
                                    <p>Este nivel da acceso a:</p>
                                    <ul>
                                        <li>Nombres</li>
                                        <li>Apellido paterno</li>
                                        <li>Apellido materno</li>
                                        <li>CURP</li>
                                        <li>Direccion</li>
                                    </ul>
                                    <br/>
                                    <strong>Nivel de acceso 3</strong>
                                    <p>Este nivel da acceso a:</p>
                                    <ul>
                                        <li>Nombres</li>
                                        <li>Apellido paterno</li>
                                        <li>Apellido materno</li>
                                        <li>CURP</li>
                                    </ul>
                                    <br/>
                                    <p> Recuerde elegir el nivel de acceso adecuado para cada persona a la que le de permiso ademas de la fecha de expiracion</p>
                                    <br/>
                                    <strong>Ejemplo:</strong>
                                    <ul>
                                        <li>
                                            Si usted va a votaciones y solicita sus datos para ver el padron electoral es recomendable dar el nivel 1 de acceso con una fecha de expiracion de 1 dia
                                        </li>
                                        <li>
                                            Si nesecitan verificar su identidad en un banco es recomendable dar el nivel 2 de acceso con una fecha de expiracion de 1 hora
                                        </li>
                                    </ul>
                                </div>
                            </div>
                    )}
            </main>

            <footer className={styles.footer}>
                <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
                    Made with ❤️ by your frens at 🌈
                </a>
            </footer>
        </div>
    );
};

export default Home;

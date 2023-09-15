import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { useState, useEffect, use } from 'react';
import { useAccount } from 'wagmi';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core';

import { ContractFunctionExecutionError } from 'viem';
import { format } from 'date-fns';

import { FaCircleInfo } from "react-icons/fa6";

import InstitutoNacionalElectoral from '../abis/InstitutoNacionalElectoral.json';
import CredencialDigital from '../abis/CredencialDigital.json';
import SistemaPermisos from '../abis/SistemaPermisos.json';

const direccionPrincipal = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const handleError = (error: any) => {
    if (error instanceof ContractFunctionExecutionError) {
        if (error.message.includes("SistemaPermisos__AccesoDenegado()")) {
            alert(`Acceso de datos denegado`);
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

function formatUnixEpochTime(unixEpochTime: number | bigint): string {
    const unixEpochTimeAsNumber = typeof unixEpochTime === 'bigint' ? Number(unixEpochTime) : unixEpochTime;
    const formattedDate = format(new Date(unixEpochTimeAsNumber * 1000), 'dd/MM/yyyy');
    return formattedDate;
}




const Home: NextPage = () => {
    const [isClient, setIsClient] = useState(false);
    const [idUser, setIdUser] = useState<any>(null);
    const [IDMEXD, setIDMEXD] = useState<any>(null);
    const { address, isConnected } = useAccount();
    const [txHashes, setTxHashes] = useState<any[]>([]);

    const [credencialAddress, setCredencialAddress] = useState<any>(null);
    const [sistemaPermisosAddress, setSistemaPermisosAddress] = useState<any>(null);

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
            readContract({
                address: direccionPrincipal,
                abi: InstitutoNacionalElectoral.abi,
                //account: address,
                functionName: 'verAddressSistemaPermisos',
                args: [],
            }).then((res) => {
                setSistemaPermisosAddress(res);
            });
        } else {
            setCredencialAddress(null);
            setSistemaPermisosAddress(null);
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
            readContract({
                address: credencialAddress,
                abi: CredencialDigital.abi,
                account: address,
                functionName: 'getIdNumberWithSender',
                args: [],
            }).then((res) => {
                setIDMEXD(res);
                console.log(res);
            });
        }
    }
        , [isConnected, credencialAddress, address]);


    const newPermiso = () => {
        const inputIds = [
            'newPermiso_address',
            'newPermiso_fecha',
            'newPermiso_nivel',
        ];

        const inputs = inputIds.map(id => document.getElementById(id) as HTMLInputElement);
        const values = inputs.map(input => {
            const value = input.value;
            input.value = '';
            return value;
        }
        );
        if (values.includes('')) {
            alert('Ingresa todos los datos');
            return;
        }
        if (values[0] === address) {
            alert('No puedes darte permiso a ti mismo');
            return;
        }
        /// convertimos de input date a unix
        const unixTime = Math.floor(new Date(values[1]).getTime() / 1000);


        /// crear una alerta de confirmacion
        const confirmacion = confirm(`¿Estas seguro de dar permiso a ${values[0]} con nivel ${values[2]} hasta el ${values[1]}?`);
        if (!confirmacion) {
            return;
        }
        const nivelNumber = parseInt(values[2]);
        prepareWriteContract({
            address: sistemaPermisosAddress,
            abi: SistemaPermisos.abi,
            functionName: 'setPermiso',
            args: [IDMEXD, nivelNumber, values[0], unixTime],
        }).then((data) => {
            writeContract(data).then((data) => {
                setTxHashes([14, data.hash]);
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
                <h1><img src="/logo-ine-st.png" alt="Logo" className={styles.header___logo} /> Mi credencial digital</h1>
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
                {isClient && !isConnected && (
                    <div className={styles.cointainer__disconected}>
                        <h2>Desconectado</h2>
                        <p>Conectate a la red para acceder a la credencial digital</p>
                    </div>
                )}

                {isClient && isConnected && idUser && idUser.claveElector === '' && (
                    <div className={styles.container__card}>
                        <div className={styles.card_noData}>
                            < FaCircleInfo 
                                size={80}
                                color="#ffb8b8"
                            />
                            <p>No hay una credencial digital asociada a esta cuenta</p>
                            <p>Por favor, cambie la cuenta en la que tiene asociada una credencial digital o solicita en tu modulo INE mas cercano una credencial digital.</p>
                            <button className={styles.button__confirmAction} onClick={() => { window.location.href = '/'; }}>
                                Regresar
                            </button>
                        </div>
                    </div>
                )}

                {isClient && isConnected && idUser && IDMEXD && idUser.claveElector !== '' && (
                    <>
                        <div className={styles.container__card}>
                            <div className={styles.card_identidad}>
                                <h2>IDEMEXD{IDMEXD.toString()}</h2>
                                <p>Nombre: {idUser.identidad.nombre} {idUser.identidad.apellidoPaterno} {idUser.identidad.apellidoMaterno}</p>
                                <p>Clave de Elector: {idUser.claveElector}</p>
                                <p>CURP: {idUser.curp}</p>
                                <p>Fecha de registro {formatUnixEpochTime(idUser.fechaRegistro)}</p>
                                <p>Fecha de expiracion {formatUnixEpochTime(idUser.fechaVigencia)}</p>
                                <div className={styles.direccion}>
                                    <p>Calle: {idUser.direccion.calle}</p>
                                    <p>Número Exterior: {idUser.direccion.numeroExterior.toString()}</p>
                                    {idUser.direccion.numeroInterior !== 'n/a' && <p>Número Interior: {idUser.direccion.numeroInterior}</p>}
                                    <p>Colonia: {idUser.direccion.colonia}</p>
                                    <p>Código Postal: {idUser.direccion.codigoPostal.toString()}</p>
                                    <p>Sección: {idUser.direccion.seccion.toString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.container__twoSideByside}>
                            <div className={styles.container__info}>
                                <h2>Informacion</h2>
                                <p>
                                    Tu credencial digital te permite dar acceso a tus datos personales a quien tu quieras mediante niveles de acceso.
                                </p>
                                <p>Existen varios niveles:</p>
                                <br />
                                <strong>Nivel de acceso 1</strong>
                                <p>Este nivel da acceso total a tus datos personales uselo con precaucion</p>
                                <br />
                                <strong>Nivel de acceso 2</strong>
                                <p>Este nivel da acceso a:</p>
                                <ul>
                                    <li>Nombres</li>
                                    <li>Apellido paterno</li>
                                    <li>Apellido materno</li>
                                    <li>CURP</li>
                                    <li>Direccion</li>
                                </ul>
                                <br />
                                <strong>Nivel de acceso 3</strong>
                                <p>Este nivel da acceso a:</p>
                                <ul>
                                    <li>Nombres</li>
                                    <li>Apellido paterno</li>
                                    <li>Apellido materno</li>
                                    <li>CURP</li>
                                </ul>
                                <br />
                                <p> Recuerde elegir el nivel de acceso adecuado para cada persona a la que le de permiso ademas de la fecha de expiracion</p>
                                <br />
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
                            {txHashes[0] === 14 ? (
                                <SuccessMessage
                                    message="Permiso en tramite"
                                    txHash={txHashes[1]}
                                    clearTxHashes={() => setTxHashes([])}
                                />
                            ) : (
                                <div className={styles.container__leftSide}>
                                    <h2>Dar permiso</h2>
                                    <p>Firma publica del solicitante de acceso</p>
                                    <input id="newPermiso_address" className={styles.newEmployee__input} placeholder="Firma publica" />
                                    <p>Fecha de expiracion</p>
                                    <input
                                        type="datetime-local"
                                        id="newPermiso_fecha"
                                        className={styles.newEmployee__input}
                                        placeholder="Fecha y hora de expiración"
                                    />

                                    <p>Nivel de acceso</p>
                                    <select id="newPermiso_nivel" className={styles.newEmployee__select}>
                                        <option value="" disabled selected>Seleccciona un nivel de acceso</option>
                                        <option value='1'>Nivel de acceso 1</option>
                                        <option value='2'>Nivel de acceso 2</option>
                                        <option value='3'>Nivel de acceso 3</option>
                                    </select>
                                    <button className={styles.button__confirmAction} onClick={newPermiso}>
                                        Dar permiso
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
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

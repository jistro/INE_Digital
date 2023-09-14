// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { CredencialDigital } from "./CredencialDigital.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract SistemaPermisos is AccessControl {
    error SistemaPermisos__AccesoDenegado();
    error SistemaPermisos__PermisoInvalido();
    error SistemaPermisos__PermisoCaducado();

    address internal s_credencialDigitalAddress;
    CredencialDigital internal credencialDigital;

    bytes32 constant ROL_INE = keccak256("ROL_INE");

    struct metadatosPermiso {
        uint8 tipoPermiso;
        uint256 fechaCaducidad;
    }

    mapping(uint256 id  => mapping(address firmaElectronica => metadatosPermiso permiso)) public permisos;

    event PermisoDado(
        uint256 indexed fechaCaducidad,
        address indexed solicitante,
        uint8 indexed tipoPermiso
    );

    modifier soloINE {
        if (!hasRole(ROL_INE, msg.sender)){
            revert SistemaPermisos__AccesoDenegado();
        }
        _;
    }

    modifier soloOwnerCredencial (uint256 idCredencial){
        if (msg.sender != CredencialDigital(s_credencialDigitalAddress).ownerOf(idCredencial)){
            revert SistemaPermisos__AccesoDenegado();
        }
        _;
    }

    constructor () {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ROL_INE, msg.sender);
    }

    function setCredencialDigitalAddress(address _credencialDigitalAddress) external soloINE {
        s_credencialDigitalAddress = _credencialDigitalAddress;
        credencialDigital = CredencialDigital(_credencialDigitalAddress);
    }

    /**
     *  @notice Función para dar permiso a un ciudadano para que permita el acceso a sus datos
     *          Esto depende del tipo de permiso que se le quiera dar el dueño de la credencial
     *          |-Nivel-|-Descripción-|-Variables que se pueden acceder-|
     *          |   1   |  Completo   | Todos los datos                 |
     *          |   2   |  Parcial    | DatosIdentidad, CURP, Direccion |
     *          |   3   |  Identidad  | DatosIdentidad, CURP            |
     *  @param id id de la credencial
     *  @param permiso Tipo de permiso que se le quiere dar al ciudadano
     *  @param solicitante Dirección del ciudadano o organizacion que solicita el permiso
     *  @param fechaCaducidad Fecha en la que caduca el permiso
     *  @dev fechaCaducidad debe ser mayor a la fecha actual y es un timestamp el cual
     *       usa la unidad de tiempo de unix
     *  @dev permiso debe ser un número entre 1 y 3
     */
    function setPermiso(
        uint256 id, 
        uint8 permiso, 
        address solicitante,
        uint256 fechaCaducidad
    ) external soloOwnerCredencial(id) {
        if (permiso > 3){
            revert SistemaPermisos__PermisoInvalido();
        }
        if (fechaCaducidad < block.timestamp){
            revert SistemaPermisos__PermisoInvalido();
        }
        permisos[id][solicitante] = metadatosPermiso(
            permiso,
            fechaCaducidad
        );
        emit PermisoDado(
            fechaCaducidad,
            solicitante,
            permiso
        );
    }
    /**
     *  @notice Función para ver los datos de un ciudadano conforme
     *          el permiso dado
     *  @param id  id de la credencial
     *  @return datos los datos de la credencial conforme el permiso 
     *  @return tipoPermiso el nivel de permiso que se le dio al solicitante
     *  @return fechaCaducidad fecha en la que caduca el permiso
     *  @dev la fecha de retorno es conforme a la unidad de tiempo UNIX
     */
    function verDatos(uint256 id) external view returns (
        CredencialDigital.DatosCredencial memory datos, 
        uint8 tipoPermiso, 
        uint256 fechaCaducidad
    ){
        /// por defecto fechaCaducidad es 0 por lo tanto no hay permiso
        if (permisos[id][msg.sender].fechaCaducidad == 0){
            revert SistemaPermisos__AccesoDenegado();
        }
        /// chechamos que el permiso no haya caducado es decir que la fecha de caducidad sea mayor a la fecha actual
        if (block.timestamp > permisos[id][msg.sender].fechaCaducidad){
            revert SistemaPermisos__PermisoCaducado();
        }

        CredencialDigital.DatosCredencial memory datosCredencial = credencialDigital.getData(id);

        if (permisos[id][msg.sender].tipoPermiso == 1){ /// Permiso completo
            return (
                datosCredencial,
                permisos[id][msg.sender].tipoPermiso,
                permisos[id][msg.sender].fechaCaducidad
            );
        }
        if (permisos[id][msg.sender].tipoPermiso == 2){ /// Permiso parcial
            return (
                CredencialDigital.DatosCredencial(
                    datosCredencial.identidad,
                    datosCredencial.claveElector,
                    datosCredencial.curp,
                    datosCredencial.fechaRegistro,
                    datosCredencial.fechaVigencia,
                    datosCredencial.direccion
                ),
                permisos[id][msg.sender].tipoPermiso,
                permisos[id][msg.sender].fechaCaducidad
            );
        }
        if (permisos[id][msg.sender].tipoPermiso == 3){ /// Permiso identidad
            return (
                CredencialDigital.DatosCredencial(
                    datosCredencial.identidad,
                    "",
                    datosCredencial.curp,
                    datosCredencial.fechaRegistro,
                    datosCredencial.fechaVigencia,
                    CredencialDigital.Direccion(
                        "",
                        0,
                        "",
                        "",
                        0,
                        0
                    )
                ),
                permisos[id][msg.sender].tipoPermiso,
                permisos[id][msg.sender].fechaCaducidad
            );
        }
    }
}
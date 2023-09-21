// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import { CredencialDigital } from "./CredencialDigital.sol";
import { SistemaPermisos } from "./SistemaPermisos.sol";

contract InstitutoNacionalElectoral is AccessControl{
    error InstitutoNacionalElectoral__AccesoDenegado();
    error InstitutoNacionalElectoral__AccesoDenegado_NoEsAdministrador();
    error InstitutoNacionalElectoral__AccesoDenegado_NoEsEmpleado();
    error InstitutoNacionalElectoral__RolInvalido();
    error InstitutoNacionalElectoral__EmpleadoYaRegistrado();
    error InstitutoNacionalElectoral__EmpleadoNoRegistrado();
    error InstitutoNacionalElectoral__NoAutoBaja();
    error InstitutoNacionalElectoral__EmpleadoDadoDeBaja();
    error InstitutoNacionalElectoral__EmpleadoDadoDeAlta();
    error InstitutoNacionalElectoral__CredencialDigital__IdNoexiste();
    error InstitutoNacionalElectoral__CredencialDigital__FaltaDireccion();

    

    bytes32 private constant  ROL_ADMINISTRADOR = keccak256("ROL_ADMINISTRADOR");
    bytes32 private constant  ROL_EMPLEADO = keccak256("ROL_EMPLEADO");

    struct Empleado {
        uint8 areaTrabajo;
        string nombre;
        string telefono;
        string email;
        bool   status;
        uint  fechaAlta;
        uint  fechaBaja;
    }

    address s_direccionCredencialDigital;
    address s_direccionSistemaPermisos;
    CredencialDigital credencialDigital;
    SistemaPermisos sistemaPermisos;

    mapping (string => Empleado) private s_EmpleadoInfo;
    mapping (address => string) private s_EmpleadoAddressToRFC;

    event InstitutoNacionalElectoral_Event_NuevoEmpleado(
        string indexed codigoEmpleado, 
        string indexed asignacion,
        uint indexed fechaAlta
    );
    event InstitutoNacionalElectoral_Event_BajaEmpleado(
        uint indexed fechaBaja,
        string indexed codigoEmpleado,
        string indexed asignacion
    );
    event InstitutoNacionalElectoral_Event_RecontratoEmpleado(
        string indexed codigoEmpleado, 
        string indexed asignacion,
        uint indexed fechaAlta
    );

    modifier soloAdmin {
        if (!hasRole(ROL_ADMINISTRADOR, msg.sender)){
            revert InstitutoNacionalElectoral__AccesoDenegado_NoEsAdministrador();
        }
        _;
    }

    modifier soloEmpleado {
        if (!hasRole(ROL_EMPLEADO, msg.sender)){
            revert InstitutoNacionalElectoral__AccesoDenegado_NoEsEmpleado();
        }
        _;
    }

    modifier soloINE {
        if (!hasRole(ROL_ADMINISTRADOR, msg.sender) && !hasRole(ROL_EMPLEADO, msg.sender)){
            revert InstitutoNacionalElectoral__AccesoDenegado();
        }
        _;
    }
    constructor(
        address _adminAddress, 
        string memory _rfc,
        string memory _nombre,
        string memory _telefono,
        string memory _email 
    ) {
        s_EmpleadoInfo[_rfc] = Empleado(1, _nombre, _telefono, _email, true, block.timestamp, 0);
        s_EmpleadoAddressToRFC[_adminAddress] = _rfc;
        _grantRole(ROL_ADMINISTRADOR, _adminAddress);
        sistemaPermisos = new SistemaPermisos();
        credencialDigital = new CredencialDigital(
            address(sistemaPermisos), address(this)
        );
        sistemaPermisos.setCredencialDigitalAddress(address(credencialDigital));
    }

    function nuevoEmpleado(
        address _direccionEmpleado,
        uint8 _rolEmpleado,
        string memory _nombre,
        string memory  _rfc,
        string memory  _telefono,
        string memory  _email 
    ) public soloAdmin{
        if (s_EmpleadoInfo[_rfc].areaTrabajo != 0) {
            revert InstitutoNacionalElectoral__EmpleadoYaRegistrado();
        }
        if (_rolEmpleado != 1 && _rolEmpleado != 2){
            revert InstitutoNacionalElectoral__RolInvalido();
        }
        if (_rolEmpleado == 1){
            _grantRole(ROL_ADMINISTRADOR, _direccionEmpleado);
        } else {
            _grantRole(ROL_EMPLEADO, _direccionEmpleado);
        }
        s_EmpleadoInfo[_rfc] = Empleado(_rolEmpleado, _nombre, _telefono, _email, true, block.timestamp, 0);
        s_EmpleadoAddressToRFC[_direccionEmpleado] = _rfc;
    }

    function bajaEmpleado(address _direccionEmpleado) public soloAdmin {
        if (_direccionEmpleado == msg.sender){
            revert InstitutoNacionalElectoral__NoAutoBaja();
        }
        string memory _rfc = s_EmpleadoAddressToRFC[_direccionEmpleado];
        if (s_EmpleadoInfo[_rfc].areaTrabajo == 0){
            revert InstitutoNacionalElectoral__EmpleadoNoRegistrado();
        }
        if (s_EmpleadoInfo[_rfc].status == false){
            revert InstitutoNacionalElectoral__EmpleadoDadoDeBaja();
        }
        if (s_EmpleadoInfo[_rfc].areaTrabajo == 1){
            _revokeRole(ROL_ADMINISTRADOR, _direccionEmpleado);
        } else {
            _revokeRole(ROL_EMPLEADO, _direccionEmpleado);
        }
        s_EmpleadoInfo[_rfc].status = false;
        s_EmpleadoInfo[_rfc].fechaBaja = block.timestamp;
        emit InstitutoNacionalElectoral_Event_BajaEmpleado(block.timestamp, _rfc, "Administrador");
    }
    function recontratoEmpleado(
        address _direccionExEmpleado,
        uint8 _rolEmpleado
    ) public soloAdmin {
        if (_rolEmpleado != 1 && _rolEmpleado != 2){
            revert InstitutoNacionalElectoral__RolInvalido();
        }
        string memory _rfc = s_EmpleadoAddressToRFC[_direccionExEmpleado];
        if (s_EmpleadoInfo[_rfc].status == true){
            revert InstitutoNacionalElectoral__EmpleadoDadoDeAlta();
        }
        if (s_EmpleadoInfo[_rfc].areaTrabajo == 0){
            revert InstitutoNacionalElectoral__EmpleadoNoRegistrado();
        }
        if (_rolEmpleado == 1) {
            _grantRole(ROL_ADMINISTRADOR, _direccionExEmpleado);
            emit InstitutoNacionalElectoral_Event_RecontratoEmpleado(_rfc, "Administrador", block.timestamp);
        } else {
            _grantRole(ROL_EMPLEADO, _direccionExEmpleado);
            emit InstitutoNacionalElectoral_Event_RecontratoEmpleado(_rfc, "Empleado", block.timestamp);
        }
        s_EmpleadoInfo[_rfc].status = true;
        s_EmpleadoInfo[_rfc].fechaAlta = block.timestamp;
        s_EmpleadoInfo[_rfc].fechaBaja = 0;
        s_EmpleadoInfo[_rfc].areaTrabajo = _rolEmpleado;
    }

    function crearCredencial(
        address to,
        string memory nombre,
        string memory apellidoPaterno,
        string memory apellidoMaterno,
        string memory claveElector,
        string memory curp,
        uint8 generoBiologico
    ) public soloEmpleado returns (uint256 idCredencial){
        idCredencial = credencialDigital.safeMint(
            to,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            claveElector,
            curp,
            generoBiologico
        );
    }

    function cambioDireccion(
        uint256 idCredencial,
        string memory calle,
        uint256 numeroExterior,
        string memory numeroInterior,
        string memory colonia,
        uint256 codigoPostal,
        uint256 seccion
    ) public soloEmpleado {
        if (credencialDigital.idExist(idCredencial) == false){
            revert InstitutoNacionalElectoral__CredencialDigital__IdNoexiste();
        }
        credencialDigital.cambioUbicacion(
            idCredencial,
            calle,
            numeroExterior,
            numeroInterior,
            colonia,
            codigoPostal,
            seccion
        );
    }

    function renuevaVigencia(uint256 idCredencial) public soloEmpleado {
        if (credencialDigital.idExist(idCredencial) == false){
            revert InstitutoNacionalElectoral__CredencialDigital__IdNoexiste();
        }
        if (credencialDigital.chechIfIDHasDirection(idCredencial) == false){
            revert InstitutoNacionalElectoral__CredencialDigital__FaltaDireccion();
        }
        credencialDigital.renuevaVigencia(idCredencial);
    }

    function verDatosEmpleado (
        address _direccionEmpleado
    ) public view  soloAdmin returns (
        Empleado memory metadataEmpleado
    ) {
        string memory _rfc = s_EmpleadoAddressToRFC[_direccionEmpleado];
        return s_EmpleadoInfo[_rfc];
    }

    function verDatosPersonales() public view returns (
        Empleado memory metadataEmpleado
    ) {
        string memory _rfc = s_EmpleadoAddressToRFC[msg.sender];
        return s_EmpleadoInfo[_rfc];
    }

    function verAddressCredecialDigital() public view returns(
        address addressCredencialDigital
    ) {
        return address(credencialDigital);
    }

    function verAddressSistemaPermisos() public view returns(
        address addressSistemaPermisos
    ) {
        return address(sistemaPermisos);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { Script, console } from "forge-std/Script.sol";
import { InstitutoNacionalElectoral } from "../src/InstitutoNacionalElectoral.sol";

contract DeploySystemTest is Script {

    InstitutoNacionalElectoral ine;


    address adminAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    string rfc = "JUPE-123456";
    string nombre = "Juan Perez";
    string telefono = "1234567890";
    string correo = "juan@ine.mx";
    
    function run() external returns(address){
        vm.startBroadcast(adminAddress);
            ine = new InstitutoNacionalElectoral(adminAddress,rfc,nombre,telefono,correo);
            console.log("INE address: ", address(ine));
            console.log("Direccion es admin: ", ine.hasRole(keccak256("ROL_ADMINISTRADOR"), adminAddress));
            console.log("Nombre: ", ine.verDatosEmpleado(adminAddress).nombre);
        return(address(ine));
    }
}
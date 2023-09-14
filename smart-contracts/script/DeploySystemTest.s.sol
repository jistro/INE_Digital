// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { Script, console } from "forge-std/Script.sol";
import { InstitutoNacionalElectoral } from "../src/InstitutoNacionalElectoral.sol";

contract DeploySystemTest is Script {

    InstitutoNacionalElectoral ine;


    address adminAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address employeeAddress = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    string rfc = "JUPE-123456";
    string nombre = "Juan Perez";
    string telefono = "1234567890";
    string correo = "juan@ine.mx";
    
    function run() external returns(address){
        vm.startBroadcast(adminAddress);
            ine = new InstitutoNacionalElectoral(adminAddress,rfc,nombre,telefono,correo);
            ine.nuevoEmpleado(
                employeeAddress,
                2,
                "Cosme Fulanito",
                "cosm-55555",
                "65525354156",
                "cosme@ine.mx"
            );
        return(address(ine));
    }
}
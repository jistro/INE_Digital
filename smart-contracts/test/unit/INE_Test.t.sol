//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import { InstitutoNacionalElectoral } from "../../src/InstitutoNacionalElectoral.sol";
import { CredencialDigital } from "../../src/CredencialDigital.sol";
import { SistemaPermisos } from "../../src/SistemaPermisos.sol";

contract INETest is Test {

    InstitutoNacionalElectoral ine;

    address ADMIN = makeAddr("ADMIN");
    address EMPLEADO = makeAddr("EMPLEADO");
    address CIUDADANO = makeAddr("CIUDADANO");
    address DUMMY = makeAddr("DUMMY");

    function setUp() external {
            ine = new InstitutoNacionalElectoral(
                ADMIN,
                "JUPE-123456",
                "Juan Perez",
                "1234567890",
                "juan@ine.mx"
            );
    }

    function testVerificarPrimerEmpleado() public{
        vm.startPrank(ADMIN);
        
    }   
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CredencialDigital is ERC721, AccessControl {
    using Counters for Counters.Counter;

    error CredencialDigital__AccesoDenegado();
    error CredencialDigital__IdNoexiste();
    error CredencialDigital__CredecialYaExiste();

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");

    Counters.Counter private _tokenIdCounter;

    struct DatosIdentidad {
        string nombre;
        string apellidoPaterno;
        string apellidoMaterno;
        uint8 generoBiologico;
    }

    struct Direccion {
        string calle;
        uint256 numeroExterior;
        string numeroInterior;
        string colonia;
        uint256 codigoPostal;
        uint256 seccion;
    }

    struct DatosCredencial {
        DatosIdentidad identidad;
        string claveElector;
        string curp;
        uint256 fechaRegistro;
        uint256 fechaVigencia;
        Direccion direccion;
    }

    mapping(uint256 idCredencial => DatosCredencial datosCredencial) public ciudadano;
    mapping(string claveElector => uint256 idCredencial) public credencialPorClaveElector;
    mapping(address ciudadano => uint256 idCredencial) public credencialPorDireccion;


    constructor(address addressBroker, address addressINE) ERC721("CredencialDigital", "INE") {
        _grantRole(DEFAULT_ADMIN_ROLE, addressINE);
        _grantRole(MINTER_ROLE, addressINE);
        _grantRole(DATA_PROVIDER_ROLE, addressBroker);
    }

    
    function safeMint(
        address to,
        string memory nombre,
        string memory apellidoPaterno,
        string memory apellidoMaterno,
        string memory claveElector,
        string memory curp,
        uint8 generoBiologico
    ) public onlyRole(MINTER_ROLE) returns(uint256 id) {
        if(credencialPorClaveElector[claveElector] != 0){
            revert CredencialDigital__CredecialYaExiste();
        }
        if (credencialPorDireccion[to] != 0){
            revert CredencialDigital__CredecialYaExiste();
        }
        uint256 tokenId = _tokenIdCounter.current() + 1;
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        uint256 fechaRegistro = block.timestamp;
        uint256 fechaVigencia = fechaRegistro + 3650 days;
        credencialPorClaveElector[claveElector] = tokenId;
        ciudadano[tokenId] = DatosCredencial(
            DatosIdentidad(nombre, apellidoPaterno, apellidoMaterno, generoBiologico),
            claveElector,
            curp,
            fechaRegistro,
            fechaVigencia,
            Direccion("", 0, "", "", 0, 0)
        );
        credencialPorDireccion[to] = tokenId;
        return tokenId;
    }

    function cambioUbicacion(
        uint256 tokenId,
        string memory calle,
        uint256 numeroExterior,
        string memory numeroInterior,
        string memory colonia,
        uint256 codigoPostal,
        uint256 seccion
    ) public onlyRole(MINTER_ROLE) {
        if (ciudadano[tokenId].fechaRegistro == 0){
            revert CredencialDigital__IdNoexiste();
        }
        ciudadano[tokenId].direccion = Direccion(calle, numeroExterior, numeroInterior, colonia, codigoPostal, seccion);
    }

    function getData(uint256 tokenId) public view onlyRole(DATA_PROVIDER_ROLE) returns (DatosCredencial memory) {
        return ciudadano[tokenId];
    }

    function getIDwithSender() public view returns (DatosCredencial memory) {
        uint256 id = credencialPorDireccion[msg.sender];
        return ciudadano[id];
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
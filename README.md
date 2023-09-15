![header](assets_README/img/Header_PIB_2023.jpg)
# INE digital: Un acercamiento a la identidad digital utilizando la tecnología blockchain

En este repositorio se encuentra el código fuente del proyecto postulado para el Premio de Innovación y Buenas Prácticas en Protección de Datos Personales 2023 del INAI.

## Descripción del proyecto
El proyecto consiste en un acercamiento a la tecnología blockchain y su aplicación en la identidad digital. En este se encuentra los siguientes elementos:
- Una aplicación web que permite crear una identidad digital y realizar tramites para la obtención de una credencial de elector digital, ademas de que el dueño de la credencial pueda permitir gestionar permisos de acceso a sus datos personales.
- Los contratos inteligentes que permiten la creación, actualización y gestion de las credenciales de elector digitales mediante el contrato del Instituto Nacional Electoral (INE) el cual al ser creado una credencial el dueño de esta puede permitir a terceros el acceso a sus datos personales dependiendo del nivel de acceso y el tiempo de acceso que se le otorgue.

## Tecnologías utilizadas
- Frontend
    - [React](https://reactjs.org/)
    - [Node.js](https://nodejs.org/es/)
    - [Raimbow kit](https://www.rainbowkit.com/)
- Backend
    - [Solidity](https://docs.soliditylang.org/en/v0.8.7/)
    - [Foundry](https://book.getfoundry.sh/)
    - [OpenZeppelin](https://openzeppelin.com/)
    - [Optimism](https://optimism.io/)

## Estructura del repositorio

    .
    ├── 📁 assets_README
    |    └── 📁 img 
    ├── 🗂️ dapp
    ├── 🗂️ smart-Contracts
    |    ├── 📁 src
    |    |   ├── 📄 CredencialDigital.sol
    |    |   ├── 📄 InstitutoNacionalElectoral.sol
    |    |   └── 📄 SistemaPermisos.sol
    ├── 📄 LICENSE
    └── 📄 README.md

📁  **assets_README**: En esta carpeta se encuentran los recursos utilizados para la elaboración del README.md.

📁 **dapp**: En esta carpeta se encuentra el código fuente de la aplicación web el cual se uso el framework de Next.js junto con Rainbown kit.

📁 **smart-Contracts**: En esta carpeta se encuentra el código fuente de los contratos inteligentes utilizados para la creación, actualización y gestión de las credenciales de elector digitales el cual se uso el framework de Foundry.

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

## Instalación del Sistema
A continuación, se describen los pasos para instalar y configurar este sistema en tu entorno local utilizando npm para las dependencias de Node.js y Foundry para los contratos inteligentes:

### Requisitos previos:
- Asegúrate de tener Foundry, Node.js y npm instalados en tu sistema. Puedes descargarlos desde el sitio web oficial de [Node.js](https://nodejs.org/es) y [Foundry](https://book.getfoundry.sh/getting-started/installation)

1. Pasos para la instalación:

Clonar el repositorio:

Abre una terminal y ejecuta el siguiente comando para clonar este repositorio en tu máquina local:

```shell
git clone https://github.com/jistro/INE_Digital
```
2. Navegar al directorio del proyecto:

Usando tres consolas, ingresa al directorio del proyecto utilizando el siguiente comando:
```shell
cd INE_Digital
```
3. Preparacion para smart contracts

La primera consola estara a cargo de la blockchain local usando foundry mediante el siguiente comando:
```shell
anvil
```
Copiamos la frase semilla y la agregamos en una extencion de wallet como [metamask](https://metamask.io/)

**IMPORTANTE: la frase semilla es solo para motivos de prueba y desarrollo y NUNCA se debe usar en produccion**

en la segunda consola, nos movemos a la seccion de smart contracts de la siguiente manera:
```shell
cd smart-contracts
```
alli para levantar los contratos de manera local entramos el siguente comando:
```shell
make deployTest
```

4. Preparacion de aplicacion (Dapp)
El la ultima consola nos movemos a la carpeta de la web app mediante:
```shell
cd dapp
```
Ejecuta el siguiente comando para instalar las dependencias del frontend:
```shell
npm install
```
¡Listo! Ahora tienes el sistema instalado y en funcionamiento en tu entorno local utilizando npm y Foundry.

## Literatura en que se baso el proyecto
- Cameron, K. (2006). The laws of identity. [https://www.identityblog.com/stories/2005/05/13/TheLawsOfIdentity.pdf](https://www.identityblog.com/stories/2005/05/13/TheLawsOfIdentity.pdf)
- Liu, Y., He, D., Obaidat, M. S., Kumar, N., Khan, M. K., & Raymond Choo, K.-K. (2020). Blockchain-based identity management systems: A review. Journal of Network and Computer Applications, 166, 102731. [https://doi.org/10.1016/j.jnca.2020.102731](https://doi.org/10.1016/j.jnca.2020.102731)

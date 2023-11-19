/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsNumber, IsString, IsUrl } from "class-validator";

export class SupermercadoDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
    
    @IsNumber()
    @IsNotEmpty()
    readonly longitude: number;
    
    @IsNumber()
    @IsNotEmpty()
    readonly latitude: number;
    
    @IsUrl()
    @IsNotEmpty()
    readonly web: string;
}

/* eslint-disable prettier/prettier */

import { CiudadEntity } from "src/ciudad/ciudad.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class SupermercadoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    longitude: number;

    @Column()
    latitude: number;

    @Column()
    web: string;

    @ManyToMany(() => CiudadEntity, ciudad => ciudad.supermercados)
    ciudades: CiudadEntity[];
}

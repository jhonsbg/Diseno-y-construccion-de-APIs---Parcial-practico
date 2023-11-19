/* eslint-disable prettier/prettier */

import { CiudadEntity } from "../ciudad/ciudad.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class SupermercadoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 4 })
    longitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 4 })
    latitude: number;

    @Column()
    web: string;

    @ManyToMany(() => CiudadEntity, ciudad => ciudad.supermercados)
    @JoinTable()
    ciudades: CiudadEntity[];
}

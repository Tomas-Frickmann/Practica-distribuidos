import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrearSocioDto } from './dto/crear-socio.dto';
import { Socio } from './entities/socio.entity';
import { SociosRepository } from './socios.repository';
import { PasswordHasher } from '@nestjs/authentication'
@Injectable()
export class SociosService {
  constructor(private readonly repo: SociosRepository, private readonly hasher: PasswordHasher,) { }

  async create(dto: CrearSocioDto) {
    if (this.repo.findByEmail(dto.email)) {
      throw new ConflictException('Ya existe un socio con ese email');
    }
    const contraseniaHash = await this.hasher.hash(dto.password);
    const soicio = this.repo.create({ ...dto, password: contraseniaHash, rol: dto.rol ?? "socio" });
    return this.sacacpntra(soicio)
  }

  private sacacpntra(socio: Socio) {
    const { password, ...resto } = socio;
    return resto;
  }
  findAll() {
    return this.repo.findAll().map((s) => this.sacacpntra(s));
  }

  findOne(id: number) {
    const socio = this.repo.findById(id);
    if (!socio) throw new NotFoundException(`El socio ${id} no existe`);
    return this.sacacpntra(socio);
  }
}

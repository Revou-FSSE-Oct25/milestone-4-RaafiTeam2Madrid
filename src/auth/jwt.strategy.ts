import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'rahasia_revo_bank_super_aman_123',
    });
  }

  async validate(payload: any) {
    // Payload ini berasal dari token yang berhasil di-decode
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
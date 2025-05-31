import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async create(@Body(new ValidationPipe()) createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  async findAll(
    @Query('doctorId', new ParseIntPipe({ optional: true })) doctorId?: number,
    @Query('clientId', new ParseIntPipe({ optional: true })) clientId?: number,
    @Query('appointmentId', new ParseIntPipe({ optional: true }))
    appointmentId?: number,
  ) {
    return this.reviewsService.findAll(doctorId, clientId, appointmentId);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reviewsService.remove(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approveReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.approveReview(id);
  }
}

import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Plus } from "lucide-react";

const ProductCard = ({ name, description, price, image, onAddToCart }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <p className="text-primary font-bold text-xl">
          R$ {price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={onAddToCart}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

import torch
import numpy as np

# tensor = torch.ones(4, 4)


# tensor=torch.cat([tensor, tensor, tensor], dim=0)
# print(tensor)

t = torch.ones(5)
n = t.numpy()
t.add_(1)
print(f"t: {t}")
print(f"n: {n}")
